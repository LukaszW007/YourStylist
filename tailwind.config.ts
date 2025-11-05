import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";

const config: Config = {
	content: [
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/hooks/**/*.{js,ts,jsx,tsx}",
		"./src/lib/**/*.{js,ts,jsx,tsx}",
		"./src/**/*.mdx",
		"./public/**/*.{js,ts}",
	],
	darkMode: "class",
	theme: {
		extend: {
			colors: {
				background: "var(--color-background)",
				foreground: "var(--color-foreground)",
				card: "var(--color-card)",
				"card-foreground": "var(--color-card-foreground)",
				popover: "var(--color-popover)",
				"popover-foreground": "var(--color-popover-foreground)",
				primary: "var(--color-primary)",
				"primary-foreground": "var(--color-primary-foreground)",
				secondary: "var(--color-secondary)",
				"secondary-foreground": "var(--color-secondary-foreground)",
				muted: "var(--color-muted)",
				"muted-foreground": "var(--color-muted-foreground)",
				accent: "var(--color-accent)",
				"accent-foreground": "var(--color-accent-foreground)",
				destructive: "var(--color-destructive)",
				"destructive-foreground": "var(--color-destructive-foreground)",
				border: "var(--color-border)",
				ring: "var(--color-ring)",
				input: "var(--color-input)",
				"input-background": "var(--color-input-background)",
				"switch-background": "var(--color-switch-background)",
				chart: {
					1: "var(--color-chart-1)",
					2: "var(--color-chart-2)",
					3: "var(--color-chart-3)",
					4: "var(--color-chart-4)",
					5: "var(--color-chart-5)",
				},
				sidebar: {
					DEFAULT: "var(--color-sidebar)",
					foreground: "var(--color-sidebar-foreground)",
					primary: "var(--color-sidebar-primary)",
					"primary-foreground": "var(--color-sidebar-primary-foreground)",
					accent: "var(--color-sidebar-accent)",
					"accent-foreground": "var(--color-sidebar-accent-foreground)",
					border: "var(--color-sidebar-border)",
					ring: "var(--color-sidebar-ring)",
				},
			},
			fontFamily: {
				sans: ["Open Sans", "system-ui", "sans-serif"],
				serif: ["Merriweather", "serif"],
				heading: ["Merriweather", "serif"],
				body: ["Open Sans", "system-ui", "sans-serif"],
			},
			borderRadius: {
				lg: "var(--radius-lg)",
				md: "var(--radius-md)",
				sm: "var(--radius-sm)",
				xl: "var(--radius-xl)",
			},
			fontSize: {
				xs: "var(--text-xs)",
				sm: "var(--text-sm)",
				base: "var(--text-base)",
				lg: "var(--text-lg)",
				xl: "var(--text-xl)",
				"2xl": "var(--text-2xl)",
				"3xl": "var(--text-3xl)",
			},
		},
	},
	plugins: [forms],
};

export default config;
