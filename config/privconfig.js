// TWITTER_CONSUMER_KEY=EosSWKFz1kCRCa8ytMDWW6PwK
// TWITTER_CONSUMER_SECRET=sGFbOddr7PWnoChJ4fGV7TWDRuuCMzSwUJqfl6ufFGtPgMZoAG
// TWITTER_ACCESS_TOKEN=2457920262-5QtbA39tb3NbmlxJe4TA82k4WLFHvXiaflEO5Ec
// TWITTER_ACCESS_SECRET=NtmVlBqarVkCtVEQPj3EeihWfCOM9VjjrNtXuB8zLjQor

//HEROKU CONFIG SETUP
//heroku config:add TWITTER_CONSUMER_KEY=EosSWKFz1kCRCa8ytMDWW6PwK TWITTER_CONSUMER_SECRET=sGFbOddr7PWnoChJ4fGV7TWDRuuCMzSwUJqfl6ufFGtPgMZoAG TWITTER_ACCESS_TOKEN=2457920262-5QtbA39tb3NbmlxJe4TA82k4WLFHvXiaflEO5Ec TWITTER_ACCESS_SECRET=NtmVlBqarVkCtVEQPj3EeihWfCOM9VjjrNtXuB8zLjQor

//AND OUR FALLBACK FOR LOCAL
module.exports = {
	local : {
		consumer_key: 'EosSWKFz1kCRCa8ytMDWW6PwK',
		consumer_secret: 'sGFbOddr7PWnoChJ4fGV7TWDRuuCMzSwUJqfl6ufFGtPgMZoAG',
		access_token_key: '2457920262-5QtbA39tb3NbmlxJe4TA82k4WLFHvXiaflEO5Ec',
		access_token_secret: 'NtmVlBqarVkCtVEQPj3EeihWfCOM9VjjrNtXuB8zLjQor'
	},
	dev : {
		consumer_key: '',
		consumer_secret: '',
		access_token_key: '',
		access_token_secret: ''
	},
	prod : {
		consumer_key: '',
		consumer_secret: '',
		access_token_key: '',
		access_token_secret: ''
	}
}