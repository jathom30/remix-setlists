import sgMail from '@sendgrid/mail'
import invariant from 'tiny-invariant'

export const verifyAccount = (email: string, magicLink: string) => {
  invariant(process.env.SENDGRID_API_KEY, 'sendgrid api key must be set')

  const msg = {
    to: email,
    from: 'jathom30@gmail.com', // Change to your verified sender
    subject: 'Verify your email',
    text: 'Click the link to verify your email address',
    html: `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify</title>
      </head>
      <body>
        <main style="max-width: 500px; margin: auto;">
          <h3 style="text-align: center;">Thanks for making an account with us!</h3>
          <p>Click the link below to verify your email and complete the signup process.</p>
          <div style="text-align: center;">
            <a
              href=${magicLink}
              style="border-radius: 10px; background-color: rgb(0, 119, 255); padding: 10px; text-decoration: none; color: white;"
            >
              Verify email
            </a>
          </div>
          <div>
            <p>If you did not sign up for an account with us, ignore this email.</p>
            <p>If you have any questions, email us at <a href="mailto:support@setlists.pro?subject=Security issue">support@setlists.pro</a></p>
          </div>
        </main>
      </body>
    </html>`
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