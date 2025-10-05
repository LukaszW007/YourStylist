"use client";
import { useState } from "react";

export default function RegisterForm() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	return (
		<form className="space-y-4 max-w-sm mx-auto">
			<h2 className="text-xl font-semibold text-center">Create account</h2>
			<input
				className="w-full border rounded px-3 py-2"
				placeholder="Email"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
			/>
			<input
				className="w-full border rounded px-3 py-2"
				placeholder="Password"
				type="password"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
			/>
			<button className="w-full bg-black text-white py-2 rounded">Sign up</button>
		</form>
	);
}
