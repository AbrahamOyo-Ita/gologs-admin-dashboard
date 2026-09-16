import type {Metadata} from "next";
import {LoginForm} from "./login-form";
import {readEnvironment} from "@/lib/env";
export const metadata:Metadata={title:"Sign in | GO Admin"};
export default async function LoginPage({searchParams}:{searchParams:Promise<{next?:string;error?:string}>}){const env=readEnvironment();const {next,error}=await searchParams;return <main className="login-page"><div className="login-glow login-glow-one"/><div className="login-glow login-glow-two"/><LoginForm next={next}/>{error==="auth_unavailable"&&<p className="login-global-error" role="alert">Authentication is temporarily unavailable. Try again shortly.</p>}{error==="auth_callback_failed"&&<p className="login-global-error" role="alert">That sign-in link is invalid or expired. Request a new code.</p>}{!env.configured&&<p className="login-global-error" role="alert">Admin authentication is not configured for this environment.</p>}</main>}
