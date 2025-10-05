"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

import { initialState, loginAction, type LoginFormState } from "@/app/[lang]/(auth)/login/actions";

type LoginFormProps = {
	lang: string;
};

function SubmitButton() {
	const { pending } = useFormStatus();

	return (
		<Button
			type="submit"
			className="w-full"
			isLoading={pending}
		>
			Log in
		</Button>
	);
}

export default function LoginForm({ lang }: LoginFormProps) {
	const [state, formAction] = useFormState<LoginFormState, FormData>(loginAction.bind(null, lang), initialState);

	return (
		<Card className="w-full max-w-md border-border/60 shadow-xl shadow-primary/5">
			<CardHeader className="px-8 pt-8 sm:px-10 sm:pt-10">
				<CardTitle className="text-3xl font-brand text-foreground">Welcome back</CardTitle>
				<CardDescription className="text-base leading-relaxed text-muted-foreground">
					Sign in to continue curating outfits tailored to your day.
				</CardDescription>
			</CardHeader>
			<CardContent className="px-8 pb-8 sm:px-10 sm:pb-10">
				<form
					className="space-y-6"
					action={formAction}
					noValidate
				>
					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							name="email"
							type="email"
							autoComplete="email"
							required
							defaultValue={state.values.email}
							aria-invalid={state.fieldErrors?.email ? true : undefined}
							aria-describedby={state.fieldErrors?.email ? "email-error" : undefined}
						/>
						{state.fieldErrors?.email ? (
							<p
								id="email-error"
								className="text-sm text-destructive"
							>
								{state.fieldErrors.email}
							</p>
						) : null}
					</div>
					<div className="space-y-2">
						<Label htmlFor="password">Password</Label>
						<Input
							id="password"
							name="password"
							type="password"
							autoComplete="current-password"
							required
							aria-invalid={state.fieldErrors?.password ? true : undefined}
							aria-describedby={state.fieldErrors?.password ? "password-error" : undefined}
						/>
						{state.fieldErrors?.password ? (
							<p
								id="password-error"
								className="text-sm text-destructive"
							>
								{state.fieldErrors.password}
							</p>
						) : null}
					</div>
					<div className="flex items-center justify-between text-sm text-muted-foreground">
						<label className="inline-flex items-center gap-2">
							<input
								type="checkbox"
								name="remember"
								className="size-4 rounded border border-input text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
							/>
							<span>Remember me</span>
						</label>
						<Link
							className="text-sm font-semibold text-primary hover:text-primary/80"
							href={`/${lang}/forgot-password`}
						>
							Forgot password?
						</Link>
					</div>
					<SubmitButton />
					{state.status === "error" && state.message ? (
						<p
							role="alert"
							className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
						>
							{state.message}
						</p>
					) : null}
					<p className="text-sm text-muted-foreground">
						New to Stylo?{" "}
						<Link
							className="font-semibold text-primary hover:text-primary/80"
							href={`/${lang}/register`}
						>
							Create an account
						</Link>
					</p>
				</form>
			</CardContent>
		</Card>
	);
}
