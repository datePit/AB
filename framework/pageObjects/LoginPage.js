// @ts-check
// node .\framework\pageObjects\LoginPage.js

import {
    BASE_URL, credentials
  } from '../config.js'



export const loginPageObj = {
    usernameInput: 'input[type="text"][id="loginform-username"]',
    passwordInput: 'input[type="password"][id="loginform-password"]',
    enterButton: 'button[type="submit"][class="btn btn-primary"]'
};
  

