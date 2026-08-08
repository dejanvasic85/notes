import * as Sentry from '@sentry/sveltekit';

import { PUBLIC_SENTRY_DSN } from '$env/static/public';

const developmentEnvironmentLabel = 'development';
const productionEnvironmentLabel = 'production';

Sentry.init({
	dsn: PUBLIC_SENTRY_DSN,
	environment: import.meta.env.DEV ? developmentEnvironmentLabel : productionEnvironmentLabel
});

export const handleError = Sentry.handleErrorWithSentry();
