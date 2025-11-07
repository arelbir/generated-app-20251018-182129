/**
 * Email Service Interface (SRP + DIP)
 * Defines email communication operations
 * Part of Interface Segregation Principle (ISP)
 */
export interface IEmailService {
  /**
   * Send welcome email to new member
   * @param to Recipient email address
   * @param name Recipient name
   */
  sendWelcomeEmail(to: string, name: string): Promise<void>;

  /**
   * Send password reset email
   * @param to Recipient email address
   * @param token Password reset token
   */
  sendPasswordResetEmail(to: string, token: string): Promise<void>;

  /**
   * Send appointment reminder email
   * @param to Recipient email address
   * @param memberName Member name
   * @param appointmentDate Appointment date and time
   * @param staffName Staff name
   */
  sendAppointmentReminder(to: string, memberName: string, appointmentDate: string, staffName: string): Promise<void>;

  /**
   * Send package expiry warning email
   * @param to Recipient email address
   * @param memberName Member name
   * @param packageName Package name
   * @param expiryDate Expiry date
   */
  sendPackageExpiryWarning(to: string, memberName: string, packageName: string, expiryDate: string): Promise<void>;

  /**
   * Send payment confirmation email
   * @param to Recipient email address
   * @param memberName Member name
   * @param amount Payment amount
   * @param paymentDate Payment date
   */
  sendPaymentConfirmation(to: string, memberName: string, amount: number, paymentDate: string): Promise<void>;

  /**
   * Send account deactivation email
   * @param to Recipient email address
   * @param name Recipient name
   */
  sendAccountDeactivationEmail(to: string, name: string): Promise<void>;

  /**
   * Send account reactivation email
   * @param to Recipient email address
   * @param name Recipient name
   */
  sendAccountReactivationEmail(to: string, name: string): Promise<void>;

  /**
   * Send email verification email
   * @param to Recipient email address
   * @param token Verification token
   */
  sendEmailVerification(to: string, token: string): Promise<void>;
}

/**
 * Email template interface for consistency
 */
export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

/**
 * Email configuration interface
 */
export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
  templates: {
    welcome: string;
    passwordReset: string;
    appointmentReminder: string;
    packageExpiry: string;
    paymentConfirmation: string;
    accountDeactivation: string;
    accountReactivation: string;
    emailVerification: string;
  };
}
