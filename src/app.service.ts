import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getAuthorInfo(): string {
    return `
      <!doctype html>
      <html>
      <head>
        <title>Ikusa Media</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body>
      <div style="font-size: 17px; margin-left: 20%; margin-right: 20%; width: auto;">

        <div style="text-align: center;">
          <p>Backend Developed by Jose Abarca | <a href="./docs" target="_blank">Backend Documentation</a></p>
        </div>

        <div>
          <ul>
            <li><a href="mailto: abarcaj.me@gmail.com" target="_blank">Email Me</a></li>
            <li><a href="https://github.com/AbarcaJ" target="_blank">GitHub</a></li>
            <li><a href="https://linked.in/AbarcaJ" target="_blank">Linkedin</a></li>
          </ul>
        </div>

        <div style="text-align: center;">
          <p>Only for Explicit usage in Ikusa Media. All Rights reserved. 2019 - ${new Date().getFullYear()}</p>
        </div>
      </div>

      </body>
      </html>
    `;
  }
}
