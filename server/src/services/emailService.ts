import nodemailer, { type Transporter } from 'nodemailer'
import { logger } from '../utils/logger.js'

export interface SendWelcomeEmailParams {
  to: string
  fullName: string
  role?: string
  tempPassword?: string
  temporaryPassword?: string
  loginUrl?: string
  centerName?: string
  logoUrl?: string
  primaryColor?: string
}

export interface SendPaymentSuccessEmailParams {
  to: string
  fullName?: string
  studentName?: string
  courseTitle: string
  invoiceCode: string
  amount: number
  paymentMethod?: string
  paidAt?: Date
  courseUrl?: string
  centerName?: string
  primaryColor?: string
}

export class EmailService {
  private static transporter: Transporter | null = null

  /**
   * Initialize or retrieve Nodemailer transporter
   */
  private static async getTransporter(): Promise<Transporter> {
    if (this.transporter) {
      return this.transporter
    }

    const host = process.env.SMTP_HOST
    const port = Number(process.env.SMTP_PORT) || 587
    const user = process.env.SMTP_USER
    const pass = process.env.SMTP_PASS

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      })
      logger.info(`[EmailService] SMTP Transporter configured (${host}:${port})`)
    } else {
      // In development or when credentials are not supplied, generate an Ethereal test account or local mock
      try {
        const testAccount = await nodemailer.createTestAccount()
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        })
        logger.info(`[EmailService] Ethereal dev email transporter initialized: ${testAccount.user}`)
      } catch (err) {
        // Fallback to json mock transport
        this.transporter = nodemailer.createTransport({
          jsonTransport: true,
        })
        logger.info('[EmailService] Fallback mock JSON transporter initialized')
      }
    }

    return this.transporter
  }

  /**
   * 1. Send Welcome Email on Account Creation / Registration
   */
  static async sendWelcomeEmail(params: SendWelcomeEmailParams) {
    try {
      const transporter = await this.getTransporter()
      const primaryColor = params.primaryColor || '#4f46e5'
      const centerName = params.centerName || 'EnglishFlow Academy'
      const loginUrl = params.loginUrl || 'http://localhost:5173/login'
      const password = params.tempPassword || params.temporaryPassword

      const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chào mừng bạn đến với ${centerName}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" border="0" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
          <!-- Header Branding -->
          <tr>
            <td style="background-color: ${primaryColor}; padding: 36px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">
                ${centerName}
              </h1>
              <p style="color: rgba(255, 255, 255, 0.85); margin: 6px 0 0 0; font-size: 13px;">
                Nền tảng Học tiếng Anh Thông minh & Chấm điểm AI
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 16px;">
                Chào mừng ${params.fullName}! 👋
              </h2>
              <p style="font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px;">
                Tài khoản của bạn đã được kích hoạt thành công trên hệ thống <strong>${centerName}</strong>. Bạn hiện có thể truy cập đầy đủ vào các khóa học, bài tập chấm điểm AI và phòng học trực tuyến.
              </p>

              <!-- Credentials Box -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; border-radius: 12px; padding: 20px; margin-bottom: 28px; border: 1px dashed #cbd5e1;">
                <tr>
                  <td style="font-size: 13px; color: #334155; line-height: 1.8;">
                    <strong>Email đăng nhập:</strong> ${params.to}<br>
                    <strong>Vai trò:</strong> ${params.role || 'Học viên (Student)'}<br>
                    ${password ? `<strong>Mật khẩu tạm thời:</strong> <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${password}</code><br>` : ''}
                    <strong>Trạng thái:</strong> <span style="color: #059669; font-weight: 600;">Đã kích hoạt</span>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto 28px auto;">
                <tr>
                  <td align="center" style="border-radius: 12px; background-color: ${primaryColor};">
                    <a href="${loginUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 14px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 12px;">
                      Đăng Nhập Vào Không Gian Học Tập →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
                Nếu bạn cần hỗ trợ kỹ thuật hoặc tư vấn lộ trình học, vui lòng liên hệ bộ phận học vụ cơ sở.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                © 2026 ${centerName}. Nền tảng EnglishFlow LMS All rights reserved.<br>
                Đây là email tự động, vui lòng không phản hồi trực tiếp vào địa chỉ này.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

      const info = await transporter.sendMail({
        from: `"${centerName}" <no-reply@englishflow.vn>`,
        to: params.to,
        subject: `Chào mừng bạn đến với ${centerName} - Thông tin tài khoản`,
        html,
      })

      logger.info(`[EmailService] Welcome email sent to ${params.to}. ID: ${info.messageId}`)
      const previewUrl = nodemailer.getTestMessageUrl(info)
      if (previewUrl) {
        logger.info(`[EmailService] Ethereal Preview URL: ${previewUrl}`)
      }

      return true
    } catch (error) {
      logger.error('[EmailService] Failed to send welcome email:', error)
      return false
    }
  }

  /**
   * 2. Send Payment Success & Electronic Invoice Email
   */
  static async sendPaymentSuccessEmail(params: SendPaymentSuccessEmailParams) {
    try {
      const transporter = await this.getTransporter()
      const primaryColor = params.primaryColor || '#4f46e5'
      const centerName = params.centerName || 'EnglishFlow Academy'
      const courseUrl = params.courseUrl || 'http://localhost:5173/student/practice'
      const paidAtStr = (params.paidAt || new Date()).toLocaleString('vi-VN')
      const studentName = params.studentName || params.fullName || 'Học viên'

      const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Biên lai thanh toán khóa học - ${params.invoiceCode}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" border="0" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #059669; padding: 32px 40px; text-align: center;">
              <span style="display: inline-block; background: rgba(255, 255, 255, 0.2); border-radius: 50%; width: 44px; height: 44px; line-height: 44px; font-size: 22px; color: #ffffff; margin-bottom: 8px;">✓</span>
              <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800;">
                THANH TOÁN THÀNH CÔNG
              </h1>
              <p style="color: rgba(255, 255, 255, 0.9); margin: 6px 0 0 0; font-size: 13px;">
                Hóa đơn điện tử & Xác nhận ghi danh khóa học
              </p>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 40px;">
              <p style="font-size: 14px; color: #475569; margin-top: 0; margin-bottom: 20px;">
                Kính gửi <strong>${studentName}</strong>,<br>
                Hệ thống xác nhận giao dịch thanh toán của bạn cho khóa học tại <strong>${centerName}</strong> đã hoàn tất thành công. Dưới đây là thông tin biên lai chi tiết:
              </p>

              <!-- Invoice Detail Table -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
                <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 12px 16px; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;">Mục thông tin</td>
                  <td align="right" style="padding: 12px 16px; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase;">Chi tiết</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 12px 16px; font-size: 13px; color: #334155;">Mã hóa đơn</td>
                  <td align="right" style="padding: 12px 16px; font-size: 13px; font-weight: 700; color: #0f172a; font-family: monospace;">${params.invoiceCode}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 12px 16px; font-size: 13px; color: #334155;">Khóa học</td>
                  <td align="right" style="padding: 12px 16px; font-size: 13px; font-weight: 600; color: #2563eb;">${params.courseTitle}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 12px 16px; font-size: 13px; color: #334155;">Thời gian thanh toán</td>
                  <td align="right" style="padding: 12px 16px; font-size: 13px; color: #64748b;">${paidAtStr}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 12px 16px; font-size: 13px; color: #334155;">Phương thức</td>
                  <td align="right" style="padding: 12px 16px; font-size: 13px; font-weight: 600; color: #0f172a;">${params.paymentMethod || 'Chuyển khoản Ngân hàng (VNPay)'}</td>
                </tr>
                <tr style="background-color: #f8fafc;">
                  <td style="padding: 14px 16px; font-size: 14px; font-weight: 800; color: #0f172a;">Tổng số tiền đã trả</td>
                  <td align="right" style="padding: 14px 16px; font-size: 16px; font-weight: 800; color: #059669;">
                    ${params.amount.toLocaleString('vi-VN')} đ
                  </td>
                </tr>
              </table>

              <!-- Notice Box -->
              <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px; margin-bottom: 28px;">
                <p style="margin: 0; font-size: 13px; color: #1e40af; line-height: 1.6;">
                  🎓 <strong>Ghi danh thành công:</strong> Bạn đã được cấp quyền truy cập ngay vào toàn bộ giáo trình, phòng luyện đề AI và các buổi học trực tuyến của khóa học.
                </p>
              </div>

              <!-- CTA Button -->
              <table border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td align="center" style="border-radius: 12px; background-color: ${primaryColor};">
                    <a href="${courseUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 14px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 12px;">
                      Vào Lớp Học Của Tôi →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                © 2026 ${centerName}. Hóa đơn điện tử hợp lệ được xuất tự động bởi EnglishFlow LMS.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

      const info = await transporter.sendMail({
        from: `"${centerName}" <billing@englishflow.vn>`,
        to: params.to,
        subject: `[Biên lai] Thanh toán khóa học ${params.courseTitle} thành công (${params.invoiceCode})`,
        html,
      })

      logger.info(`[EmailService] Payment confirmation email sent to ${params.to}. ID: ${info.messageId}`)
      const previewUrl = nodemailer.getTestMessageUrl(info)
      if (previewUrl) {
        logger.info(`[EmailService] Ethereal Invoice Preview URL: ${previewUrl}`)
      }

      return true
    } catch (error) {
      logger.error('[EmailService] Failed to send payment confirmation email:', error)
      return false
    }
  }
}
