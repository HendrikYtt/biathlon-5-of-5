import themes from 'daisyui/src/theming/themes';
import { ConfigProps } from './types/config';

const config = {
	// REQUIRED
	appName: 'Biathlon 5 of 5',
	// REQUIRED: a short description of your app for SEO tags (can be overwritten)
	appDescription:
      'The ultimate biathlon prediction platform. Forecast race outcomes, compete with friends, and enhance your biathlon viewing experience.',
	// REQUIRED (no https://, not trialing slash at the end, just the naked domain)
	domainName: 'biathlon5of5.com',
	crisp: {
		// Crisp website ID. IF YOU DON'T USE CRISP: just remove this => Then add a support email in this config file (mailgun.supportEmail) otherwise customer support won't work.
		id: '',
		// Hide Crisp by default, except on route "/". Crisp is toggled with <ButtonSupport/>. If you want to show Crisp on every routes, just remove this below
		onlyShowOnRoutes: ['/'],
	},
	stripe: {
		// Create multiple plans in your Stripe dashboard, then add them here. You can add as many plans as you want, just make sure to add the priceId
		plans: [
			{
				priceId:
            process.env.NODE_ENV === 'development'
            	? 'price_1Niyy5AxyNprDp7iZIqEyD2h'
            	: 'price_456',
				name: 'Novice Predictor',
				description: 'Perfect for biathlon fans starting their prediction journey.',
				price: 9,
				priceAnchor: 19,
				features: [
					{
						name: 'Basic prediction tools',
					},
					{ name: 'Historical race data' },
					{ name: 'Athlete performance stats' },
					{ name: 'Access to beginner prediction forums' },
				],
			},
			{
				priceId:
            process.env.NODE_ENV === 'development'
            	? 'price_1O5KtcAxyNprDp7iftKnrrpw'
            	: 'price_456',
				isFeatured: true,
				name: 'Sharp Shooter',
				description: 'For enthusiasts who want to master biathlon predictions.',
				price: 19,
				priceAnchor: 39,
				features: [
					{
						name: 'Everything in Novice Predictor',
					},
					{ name: 'Advanced statistical models' },
					{ name: 'Real-time weather impact analysis' },
					{ name: 'Access to expert prediction community' },
					{ name: 'Seasonal prediction challenges' },
					{ name: 'Priority customer support' },
				],
			},
		],
	},
	aws: {
		// If you use AWS S3/Cloudfront, put values in here
		bucket: 'bucket-name',
		bucketUrl: 'https://bucket-name.s3.amazonaws.com/',
		cdn: 'https://cdn-id.cloudfront.net/',
	},
	mailgun: {
		// subdomain to use when sending emails, if you don't have a subdomain, just remove it. Highly recommended to have one (i.e. mg.yourdomain.com or mail.yourdomain.com)
		subdomain: 'mg',
		// REQUIRED — Email 'From' field to be used when sending magic login links
		fromNoReply: 'Biathlon app <noreply@hendrik.utt@gmail.com>',
		// REQUIRED — Email 'From' field to be used when sending other emails, like abandoned carts, updates etc..
		fromAdmin: 'Hendrik at Biathlon app <hendrik.utt@gmail.com>',
		// Email shown to customer if need support. Leave empty if not needed => if empty, set up Crisp above, otherwise you won't be able to offer customer support."
		supportEmail: 'hendrik.utt@gmail.com',
		// When someone replies to supportEmail sent by the app, forward it to the email below (otherwise it's lost). If you set supportEmail to empty, this will be ignored.
		forwardRepliesTo: 'hendrik.utt@gmail.com',
	},
	colors: {
		// REQUIRED — The DaisyUI theme to use (added to the main layout.js). Leave blank for default (light & dark mode). If you any other theme than light/dark, you need to add it in config.tailwind.js in daisyui.themes.
		theme: 'mytheme',
		// REQUIRED — This color will be reflected on the whole app outside of the document (loading bar, Chrome tabs, etc..). By default it takes the primary color from your DaisyUI theme (make sure to update your the theme name after "data-theme=")
		// OR you can just do this to use a custom color: main: "#f37055". HEX only.
		main: themes['light']['primary'],
	},
	auth: {
		// REQUIRED — the path to log in users. It's use to protect private routes (like /dashboard). It's used in apiClient (/libs/api.js) upon 401 errors from our API
		loginUrl: '/signin',
		// REQUIRED — the path you want to redirect users after successfull login (i.e. /dashboard, /private). This is normally a private page for users to manage their accounts. It's used in apiClient (/libs/api.js) upon 401 errors from our API & in ButtonSignin.js
		callbackUrl: '/dashboard',
	},
} as ConfigProps;

export default config;