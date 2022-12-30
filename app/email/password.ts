import sgMail from '@sendgrid/mail'
import invariant from 'tiny-invariant'

export const passwordReset = (email: string, magicLink: string) => {
  invariant(process.env.SENDGRID_API_KEY, 'sendgrid api key must be set')

  const msg = {
    to: email,
    from: 'jathom30@gmail.com', // ! Once ready, update to support@setlists.pro
    subject: 'Password reset',
    text: 'click the link to reset your password',
    html: `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset</title>
      </head>
      <body>
        <main style="max-width: 500px; margin: auto;">
          <h3 style="text-align: center;">We received a request to reset your <strong>setlists</strong> password</h3>
          <p>Keeping your account secure is important to us. The link below will expire in 10 minutes. You can request a new link at anytime <a href="https://setlists.pro/forgotPassword">here</a>.</p>
          <div style="text-align: center;">
            <a
              href=${magicLink}
              style="border-radius: 10px; background-color: rgb(0, 119, 255); padding: 10px; text-decoration: none; color: white;"
            >
              Reset password
            </a>
          </div>
          <div>
            <p>If you did not request a password change, please contact us IMMEDIATELY so we can keep your account secure.</p>
            <p>Email us at <a href="mailto:support@setlists.pro?subject=Security issue">support@setlists.pro</a></p>
          </div>
        </main>
      </body>
    </html>`,
  }

  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  sgMail
    .send(msg)
    .then((response) => {
      console.log(response[0].statusCode)
      console.log(response[0].headers)
    })
    .catch((error) => {
      console.error(error)
    })
}