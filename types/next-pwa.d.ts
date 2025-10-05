declare module "next-pwa" {
	import type { NextConfig } from "next";

	type DeepPartial<T> = {
		[P in keyof T]?: T[P] extends Record<string, unknown> ? DeepPartial<T[P]> : T[P];
	};

	type SwcMinifyOptions = NonNullable<NextConfig["swcMinify"]> extends object ? NonNullable<NextConfig["swcMinify"]> : Record<string, never>;

	export interface PwaOptions {
		disable?: boolean;
		dynamicStartUrl?: boolean;
		dynamicStartUrlRedirect?: string;
		dynamicStartUrlRedirectUrl?: string;
		exclude?: (string | RegExp)[];
		dest?: string;
		register?: boolean;
		skipWaiting?: boolean;
		cacheStartUrl?: boolean;
		buildExcludes?: string[];
		publicExcludes?: string[];
		subdomainPrefix?: string;
		fallBacks?: {
			appShell?: string;
			image?: string;
			document?: string;
			audio?: string;
			font?: string;
		};
		runtimeCaching?: Array<Record<string, unknown>>;
		mode?: "production" | "development";
		disableDevLogs?: boolean;
		sw?: string;
		additionalManifestEntries?: string[];
		renamePrefix?: string;
		maximumFileSizeToCacheInBytes?: number;
		dangerouslyAllowInsecureHttp?: boolean;
		reloadOnOnline?: boolean;
		swcMinify?: boolean | DeepPartial<SwcMinifyOptions>;
	}

	type WithPWA = (nextConfig?: NextConfig) => NextConfig;

	const withPWA: (options?: PwaOptions) => WithPWA;

	export default withPWA;
}
