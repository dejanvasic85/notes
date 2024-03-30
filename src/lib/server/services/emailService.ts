import type { ServerError } from '$lib/types';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { taskEither as TE } from 'fp-ts';
import { SES_AWS_ACCESS_KEY_ID, SES_AWS_SECRET_ACCESS_KEY } from '$env/static/private';
import { withError } from '../createError';

let cachedClient: SESClient;

const getClient = () => {
	if (cachedClient) {
		return cachedClient;
	}

	cachedClient = new SESClient({
		region: 'ap-southeast-2',
		credentials: {
			accessKeyId: SES_AWS_ACCESS_KEY_ID,
			secretAccessKey: SES_AWS_SECRET_ACCESS_KEY
		}
	});
	return cachedClient;
};

interface SendEmailParams {
	to: string;
	subject: string;
	html: string;
}

export const sendEmail = ({
	to,
	subject,
	html
}: SendEmailParams): TE.TaskEither<ServerError, void> => {
	return TE.tryCatch(
		async () => {
			const client = getClient();
			await client.send(
				new SendEmailCommand({
					Destination: {
						ToAddresses: [to]
					},
					Message: {
						Body: {
							Html: {
								Charset: 'UTF-8',
								Data: html
							}
						},
						Subject: {
							Charset: 'UTF-8',
							Data: subject
						}
					},
					Source: 'Notes App <info@dejanvasic.me>'
				})
			);
		},
		withError('SendEmailError', 'Failed to send email')
	);
};
