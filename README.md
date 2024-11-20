# Checkout JS

Checkout JS is a browser-based application providing a seamless UI for BigCommerce shoppers to complete their checkout. It is also known as [Optimized One-Page Checkout](https://support.bigcommerce.com/s/article/Optimized-Single-Page-Checkout), which is currently the recommended checkout option for all BigCommerce stores.

## Requirements

In order to build from the source code, you must have the following set up in your development environment.

* Node >= v20.
* NPM >= v9.
* Unix-based operating system. (WSL on Windows)

One of the simplest ways to install Node is using [NVM](https://github.com/nvm-sh/nvm#installation-and-update). You can follow their instructions to set up your environment if it is not already set up.

## Development

Once you have cloned the repository and set up your environment, you can start developing with it.

First, you have to pull in the dependencies required for the application.

```sh
npm ci
```

After that, you can make changes to the source code and run the following command to build it.

```sh
npm run build
```

If you are developing the application locally and want to build the source code in watch mode, you can run the following command:

```sh
npm run dev
```

If you want to create a prerelease (i.e.: `alpha`) for testing in the integration environment, you can run the following command:

```sh
npm run release:alpha
```

After that, you need to push the prerelease tag to your fork so it can be referenced remotely.

### Testing

To run E2E tests, use the following command:

```sh
npm run e2e
```

The E2E tests in this project use HAR files to stub network calls. If you need to manually update the HAR files to make minor changes to the requests, you must run the command below to regenerate the ID for each updated request. Otherwise, the stubs will not function properly.

```sh
npm run regenerate-har
```

## Custom Checkout installation

Follow [this guide](https://developer.bigcommerce.com/stencil-docs/customizing-checkout/installing-custom-checkouts) for instructions on how to fork and install this app as a Custom Checkout in your store.

If you want to test your checkout implementation, you can run:
```sh
npm run dev:server
```

And enter the local URL for `auto-loader-dev.js` in Checkout Settings, e.g `http://127.0.0.1:8080/auto-loader-dev.js`

## Release

Everytime a PR is merged to the master branch, CircleCI will trigger a build automatically. However, it won't create a new Git release until it is approved by a person with write access to the repository. If you have write access, you can approve a release job by going to [CircleCI](https://circleci.com/gh/bigcommerce/workflows/checkout-js/tree/master) and look for the job you wish to approve. You can also navigate directly to the release job by clicking on the yellow dot next to the merged commit.


## Contribution

We currently do not accept Pull Requests from external parties. However, if you are an external party and want to report a bug or provide your feedback, you are more than welcome to raise a GitHub Issue. We will attend to these issues as quickly as we can.

More information can be found in the [contribution guide](CONTRIBUTING.md) and [code of conduct](CODE_OF_CONDUCT.md) for this project.


Copyright (C) 2019-Present BigCommerce Inc. All rights reserved.

## Monero

![alt text](https://i.ibb.co/6XDCKH1/2-1.png)
![alt text](https://i.ibb.co/Y7K2srY/1-1.png)


## Setup instructions

1. Install cyberduck: https://cyberduck.io/download/, this is needed to upload the custom checkout.

2. Download the checkout zip (and unzip it) from releases or build from source. If building from source follow the instructions above and rename the "dist" folder to "checkout".

3. After creating a store (free trial available here: https://www.bigcommerce.com/start-your-trial/) and logging in, follow this guide to set up WebDAV: https://support.bigcommerce.com/s/article/File-Access-WebDAV?language=en_US and drag the "checkout" folder into the "content" folder.
![alt text](https://i.ibb.co/4JY3J52/13.png)

4. Then go to settings and search for "checkout".
![alt text](https://i.ibb.co/DGj89Bn/2.png)

5. Check "Custom Checkout" and then enter the script URL. The version number after "auto-loader" can be found in the "checkout" folder. Remember to save.
![alt text](https://i.ibb.co/kyppJHR/3.png)
![alt text](https://i.ibb.co/4K2Lbkc/4.png)

6. Go back to settings and search for "payments", then enable "Pay in Store".
![alt text](https://i.ibb.co/mCghMQM/5.png)
![alt text](https://i.ibb.co/0DPcpbz/6.png)

7. Enter the display name "Monero", clear "Payment Information" and save.
![alt text](https://i.ibb.co/YphVGKJ/7.png)

8. Go back to settings and search for "api" and go to Store-level API accounts. Then create API account - this is used to update order statuses. Change the name to Monero and enable "modify" for orders and save. You should get an access token, this will be used later when setting up the backend.
![alt text](https://i.ibb.co/LthX8B9/9.png)
![alt text](https://i.ibb.co/6JMX6ss/10.png)
![alt text](https://i.ibb.co/JB4ZQgR/11.png)
![alt text](https://i.ibb.co/jZC06Jt/12.png)

9. (optional) In order to send a link with the payment instructions in the order confirmation email. Get the custom email template from https://github.com/atsamd21/checkout-js-monero/blob/master/custom_emails/invoice_email.html. Open it in a text editor and find the line:
```html
<a class="payment-link" href="https://localhost:5101/OrderPayment?email={{customer.email}}&orderId={{order.id}}&store={{store.name}}">Click here to pay with Monero</a>
```
replace "localhost" with the domain name of where you will host the API
then in the store dashboard on the left, go to Marketing->Order Email->Code and replace the code in there with invoice_email.html

10. Finally we need to get the store id, the easiest way to find this is in the url https://store-[STORE_ID].mybigcommerce.com/. Save this as well and go to the Monero.API repo and follow the instructions there.
