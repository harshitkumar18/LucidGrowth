import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailAnalysisService {
  private readonly logger = new Logger(EmailAnalysisService.name);

  async analyzeEmail(emailData: any) {
    try {
      const receivingChain = this.extractReceivingChain(emailData.headers);
      const espAnalysis = this.detectESP(emailData.headers, receivingChain);

      return {
        receivingChain,
        espType: espAnalysis.provider,
        espDetails: espAnalysis,
      };
    } catch (error) {
      this.logger.error('Error analyzing email:', error);
      throw error;
    }
  }

  private extractReceivingChain(headers: Record<string, any>): Array<{
    server: string;
    timestamp: string;
    by: string;
    with: string;
    id: string;
    from?: string;
    for?: string;
    helo?: string;
    ip?: string;
    to?: string;
    protocol?: string;
    delayMs?: number;
    delayHuman?: string;
  }> {
    const receivingChain = [];
    
    // Parse Received and X-Received headers (in reverse order as they're added chronologically)
    const receivedHeaders = (headers as any)['received'] || [];
    const xReceivedHeaders = (headers as any)['x-received'] || [];
    const receivedArray = [
      ...(Array.isArray(receivedHeaders) ? receivedHeaders : [receivedHeaders]),
      ...(Array.isArray(xReceivedHeaders) ? xReceivedHeaders : [xReceivedHeaders]),
    ].filter(Boolean);
    
    // Reverse to get chronological order (oldest first)
    receivedArray.reverse().forEach((received, index) => {
      if (received) {
        const receivedStr = typeof received === 'string'
          ? received
          : (received && typeof received === 'object' && 'value' in received ? (received as any).value : String(received));
        const parsed = this.parseReceivedHeader(receivedStr);
        if (parsed) {
          receivingChain.push({
            ...parsed,
            server: `Server ${index + 1}`,
          });
        }
      }
    });

    // Compute per-hop delays if timestamps are present
    for (let i = 0; i < receivingChain.length; i++) {
      const currentTs = Date.parse(receivingChain[i].timestamp);
      const prevTs = i > 0 ? Date.parse(receivingChain[i - 1].timestamp) : NaN;
      if (!isNaN(currentTs) && !isNaN(prevTs)) {
        const diff = Math.max(0, currentTs - prevTs);
        receivingChain[i].delayMs = diff;
        receivingChain[i].delayHuman = this.formatDelay(diff);
      }
      // Normalize protocol from 'with'
      if (receivingChain[i].with && receivingChain[i].with !== 'Unknown') {
        receivingChain[i].protocol = receivingChain[i].with.toUpperCase();
      }
      // Ensure 'to' is the server in the 'by' clause
      if (!receivingChain[i].to && receivingChain[i].by) {
        receivingChain[i].to = receivingChain[i].by;
      }
      // If 'from' is missing (common in X-Received), infer from previous hop's 'by'
      if (!receivingChain[i].from && i > 0) {
        const prev = receivingChain[i - 1];
        receivingChain[i].from = prev.by || prev.ip || prev.from || 'Unknown';
      }
    }

    return receivingChain;
  }

  private parseReceivedHeader(received: string): any {
    try {
      // Try to extract common parts from RFC 5321/5322 style Received headers
      // Examples vary a lot across MTAs; we use permissive regexes and fallbacks
      // Support multiple date formats often seen in Received headers; allow folded lines
      const unfolded = received.replace(/\r?\n[\t ]+/g, ' ');
      const timestampMatch = unfolded.match(/;\s*([A-Za-z]{3},\s+\d{1,2}\s+[A-Za-z]{3}\s+\d{4}\s+\d{1,2}:\d{2}:\d{2}\s+[A-Z]{3}(?:\s*\([^)]+\))?)/)
        || unfolded.match(/;\s*([A-Za-z]{3},\s+\d{1,2}\s+[A-Za-z]{3}\s+\d{4}\s+\d{2}:\d{2}:\d{2}\s+[+-]\d{4}(?:\s*\([^)]+\))?)/)
        || unfolded.match(/;\s*(\d{1,2}\s+[A-Za-z]{3}\s+\d{4}\s+\d{2}:\d{2}:\d{2}\s+GMT[+-]\d{1,2}:?\d{2})/);
      // Capture tokens after keywords, allowing common separators
      let byMatch = unfolded.match(/\bby\s+([^\s;()]+)(?=\s+(?:with|id|for|;|\(|$))/i) || unfolded.match(/\bby\s+([^\s;()]+)/i);
      const fromMatch = unfolded.match(/\bfrom\s+([^\s;()]+)(?:\s\(([^)]+)\))?/i);
      const withMatch = unfolded.match(/\bwith\s+([^\s;()]+)/i);
      const idMatch = unfolded.match(/\bid\s+([^\s;()]+)/i);
      const forMatch = unfolded.match(/\bfor\s+<([^>]+)>/i);
      const toMatch = unfolded.match(/\bto\s+([^;\s]+)/i) || unfolded.match(/\bby\s+([^\s;()]+)/i);

      // Try to extract HELO/EHLO name and IP from the optional parenthesis after from ... (helo=..., ip=...)
      let helo: string | undefined;
      let ip: string | undefined;
      if (fromMatch && fromMatch[2]) {
        const heloMatch = fromMatch[2].match(/helo=([^;\s)]+)/i) || fromMatch[2].match(/\bEH?LO\s+([^;\s)]+)/i);
        // Prefer bracketed IPs [x.x.x.x] or IPv6 in brackets
        const bracketIP = fromMatch[2].match(/\[([0-9]{1,3}(?:\.[0-9]{1,3}){3}|[a-f0-9:]{3,})\]/i);
        // Fallback: bare IPv4 not adjacent to letters
        const bareIPv4 = fromMatch[2].match(/(^|\s)([0-9]{1,3}(?:\.[0-9]{1,3}){3})(?=\s|$)/);
        const ipMatch = bracketIP || bareIPv4;
        helo = heloMatch ? heloMatch[1] : undefined;
        ip = ipMatch ? (bracketIP ? bracketIP[1] : bareIPv4 ? bareIPv4[2] : undefined) : undefined;
      } else {
        // Fallback: common pattern "from host (host [ip])"
        const ipFallback = received.match(/\(([^(]*?)\s*\[([0-9]{1,3}(?:\.[0-9]{1,3}){3}|[a-f0-9:]{3,})\]\)/i);
        if (ipFallback) {
          ip = ipFallback[2];
        }
      }

      // If 'by' not captured before parentheses, try to extract hostname within parentheses after 'by X (Y)'
      if (!byMatch) {
        const byParen = unfolded.match(/\bby\s+[^\s;()]+\s*\(([^)]+)\)/i);
        if (byParen) {
          const hostInParen = byParen[1].match(/^[^\s\[]+/);
          if (hostInParen) {
            byMatch = [hostInParen[0], hostInParen[0]] as any;
          }
        }
      }

      return {
        timestamp: timestampMatch ? timestampMatch[1] : 'Unknown',
        by: byMatch ? byMatch[1] : 'Unknown',
        with: withMatch ? withMatch[1] : 'Unknown',
        id: idMatch ? idMatch[1] : 'Unknown',
        from: fromMatch ? fromMatch[1] : undefined,
        for: forMatch ? forMatch[1] : undefined,
        helo,
        ip,
        to: toMatch ? toMatch[1] : undefined,
      };
    } catch (error) {
      this.logger.warn('Error parsing received header:', received);
      return null;
    }
  }

  private detectESP(headers: Record<string, any>, receivingChain: any[]): {
    provider: string;
    confidence: number;
    indicators: string[];
  } {
    const indicators: string[] = [];
    let confidence = 0;
    let provider = 'Unknown';

    // Helper: safely get header (can be array or string)
    const getHeader = (key: string): string => {
      const v = (headers as any)[key];
      if (!v) return '';
      return Array.isArray(v) ? String(v[0]) : String(v);
    };

    // Check X-Originating-IP header
    const originatingIP = getHeader('x-originating-ip');
    if (originatingIP) {
      indicators.push(`X-Originating-IP: ${originatingIP}`);
    }

    // Check X-Mailer header
    const mailer = getHeader('x-mailer');
    if (mailer) {
      indicators.push(`X-Mailer: ${mailer}`);
      if (mailer.toLowerCase().includes('gmail')) {
        provider = 'Gmail';
        confidence = 0.9;
      } else if (mailer.toLowerCase().includes('outlook')) {
        provider = 'Outlook';
        confidence = 0.9;
      }
    }

    // Check X-Sender header
    const sender = getHeader('x-sender');
    if (sender) {
      indicators.push(`X-Sender: ${sender}`);
    }

    // Check Authentication-Results
    const authResults = getHeader('authentication-results');
    if (authResults) {
      indicators.push(`Authentication-Results: ${authResults}`);
    }

    // Check DKIM signatures
    const dkimSignature = getHeader('dkim-signature');
    if (dkimSignature) {
      indicators.push(`DKIM-Signature: ${dkimSignature.substring(0, 50)}...`);
    }

    // Extract DKIM signing domain (d=)
    let dkimDomain: string | undefined;
    const dkimDomainMatch = dkimSignature && dkimSignature.match(/\bd=([^;\s]+)/i);
    if (dkimDomainMatch) {
      dkimDomain = dkimDomainMatch[1].toLowerCase();
      indicators.push(`DKIM d=${dkimDomain}`);
    }

    // Message-ID domain (useful for custom domains on Google/Microsoft)
    const messageId = getHeader('message-id');
    let messageIdDomain: string | undefined;
    const msgIdDomainMatch = messageId && messageId.match(/@([^>]+)>?$/);
    if (msgIdDomainMatch) {
      messageIdDomain = msgIdDomainMatch[1].toLowerCase();
      indicators.push(`Message-ID domain: ${messageIdDomain}`);
    }

    // Return-Path domain
    const returnPath = getHeader('return-path');
    let returnPathDomain: string | undefined;
    const returnPathMatch = returnPath && returnPath.match(/<[^@]+@([^>]+)>/);
    if (returnPathMatch) {
      returnPathDomain = returnPathMatch[1].toLowerCase();
      indicators.push(`Return-Path domain: ${returnPathDomain}`);
    }

    // Analyze receiving chain for ESP indicators
    receivingChain.forEach((hop, index) => {
      const by = hop.by.toLowerCase();
      const withProtocol = hop.with.toLowerCase();

      // Gmail indicators
      if (by.includes('google.com') || by.includes('gmail.com')) {
        provider = 'Gmail';
        confidence = Math.max(confidence, 0.95);
        indicators.push(`Gmail server detected: ${hop.by}`);
      }

      // Outlook/Hotmail indicators
      if (
        by.includes('outlook.com') ||
        by.includes('hotmail.com') ||
        by.includes('live.com') ||
        by.includes('protection.outlook.com') ||
        by.includes('outlook.office365.com') ||
        by.includes('prod.outlook.com')
      ) {
        provider = 'Outlook';
        confidence = Math.max(confidence, 0.95);
        indicators.push(`Outlook server detected: ${hop.by}`);
      }

      // Yahoo indicators
      if (by.includes('yahoo.com') || by.includes('yahoodns.net')) {
        provider = 'Yahoo';
        confidence = Math.max(confidence, 0.95);
        indicators.push(`Yahoo server detected: ${hop.by}`);
      }

      // Amazon SES indicators
      if (by.includes('amazonaws.com') || by.includes('ses.amazonaws.com')) {
        provider = 'Amazon SES';
        confidence = Math.max(confidence, 0.9);
        indicators.push(`Amazon SES server detected: ${hop.by}`);
      }

      // SendGrid indicators
      if (by.includes('sendgrid.net') || by.includes('sendgrid.com')) {
        provider = 'SendGrid';
        confidence = Math.max(confidence, 0.9);
        indicators.push(`SendGrid server detected: ${hop.by}`);
      }

      // Mailgun indicators
      if (by.includes('mailgun.org') || by.includes('mailgun.com')) {
        provider = 'Mailgun';
        confidence = Math.max(confidence, 0.9);
        indicators.push(`Mailgun server detected: ${hop.by}`);
      }

      // SparkPost indicators
      if (by.includes('sparkpostmail.com') || by.includes('spf.sparkpostmail.com')) {
        provider = 'SparkPost';
        confidence = Math.max(confidence, 0.9);
        indicators.push(`SparkPost server detected: ${hop.by}`);
      }

      // Postmark indicators
      if (by.includes('pm.mtasv.net') || by.includes('postmarkapp.com')) {
        provider = 'Postmark';
        confidence = Math.max(confidence, 0.9);
        indicators.push(`Postmark server detected: ${hop.by}`);
      }

      // Mailjet indicators
      if (by.includes('mailjet.com') || by.includes('in.mailjet.com')) {
        provider = 'Mailjet';
        confidence = Math.max(confidence, 0.85);
        indicators.push(`Mailjet server detected: ${hop.by}`);
      }

      // Brevo/Sendinblue indicators
      if (by.includes('sendinblue.com') || by.includes('brevo.com')) {
        provider = 'Brevo (Sendinblue)';
        confidence = Math.max(confidence, 0.85);
        indicators.push(`Brevo/Sendinblue server detected: ${hop.by}`);
      }

      // Zoho indicators
      if (by.includes('zoho.com') || by.includes('zohomail.com')) {
        provider = 'Zoho';
        confidence = Math.max(confidence, 0.9);
        indicators.push(`Zoho server detected: ${hop.by}`);
      }

      // Custom/Private server indicators
      if (index === 0 && !by.includes('gmail.com') && !by.includes('outlook.com') && 
          !by.includes('yahoo.com') && !by.includes('amazonaws.com')) {
        if (confidence < 0.5) {
          provider = 'Custom/Private Server';
          confidence = 0.3;
          indicators.push(`Custom server detected: ${hop.by}`);
        }
      }
    });

    // Check From domain for additional clues
    const fromHeader = getHeader('from');
    if (fromHeader) {
      const fromDomain = fromHeader.match(/@([^>]+)/);
      if (fromDomain) {
        const domain = fromDomain[1].toLowerCase();
        
        if (domain.includes('gmail.com')) {
          provider = 'Gmail';
          confidence = Math.max(confidence, 0.8);
          indicators.push(`Gmail domain detected: ${domain}`);
        } else if (domain.includes('outlook.com') || domain.includes('hotmail.com') || domain.includes('live.com')) {
          provider = 'Outlook';
          confidence = Math.max(confidence, 0.8);
          indicators.push(`Outlook domain detected: ${domain}`);
        } else if (domain.includes('yahoo.com')) {
          provider = 'Yahoo';
          confidence = Math.max(confidence, 0.8);
          indicators.push(`Yahoo domain detected: ${domain}`);
        }
      }
    }

    // Heuristic: Custom domain hosted on Google Workspace or Microsoft 365
    // Use DKIM/Return-Path/Message-ID domains combined with Received hops
    const chainHosts = receivingChain.map(h => `${(h.by || '').toLowerCase()} ${(h.from || '').toLowerCase()}`).join(' ');
    const anyGoogle = /google\.com|gmail\.com|googlemail\.com/.test(chainHosts);
    const anyMicrosoft = /outlook\.com|protection\.outlook\.com|office365\.com|prod\.outlook\.com/.test(chainHosts);
    if (confidence < 0.85 && (dkimDomain || returnPathDomain || messageIdDomain)) {
      const domainHint = (dkimDomain || returnPathDomain || messageIdDomain) as string;
      if (!/gmail\.com|outlook\.com|hotmail\.com|yahoo\.com/.test(domainHint)) {
        if (anyGoogle) {
          provider = 'Google Workspace';
          confidence = Math.max(confidence, 0.85);
          indicators.push(`Custom domain (${domainHint}) with Google routing`);
        } else if (anyMicrosoft) {
          provider = 'Microsoft 365';
          confidence = Math.max(confidence, 0.85);
          indicators.push(`Custom domain (${domainHint}) with Microsoft routing`);
        }
      }
    }

    // If no specific ESP detected, try to infer from server patterns
    if (confidence < 0.5) {
      const firstHop = receivingChain[0];
      if (firstHop) {
        const by = firstHop.by.toLowerCase();
        
        if (by.includes('mx') || by.includes('mail')) {
          provider = 'Custom/Private Server';
          confidence = 0.4;
          indicators.push(`Mail server pattern detected: ${firstHop.by}`);
        } else {
          provider = 'Unknown/Third-party';
          confidence = 0.2;
          indicators.push(`Unrecognized server pattern: ${firstHop.by}`);
        }
      }
    }

    return {
      provider,
      confidence: Math.round(confidence * 100) / 100,
      indicators,
    };
  }

  private formatDelay(ms: number): string {
    if (ms < 1000) return `${ms} ms`;
    const sec = Math.round(ms / 1000);
    if (sec < 60) return `${sec} sec`;
    const min = Math.floor(sec / 60);
    const remSec = sec % 60;
    if (min < 60) return remSec ? `${min} min ${remSec} sec` : `${min} min`;
    const hrs = Math.floor(min / 60);
    const remMin = min % 60;
    return remMin ? `${hrs} hr ${remMin} min` : `${hrs} hr`;
  }
}
