/* eslint-disable react-refresh/only-export-components */
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useBoundStore } from "@/store/client/use-store"
import { useLogin } from "@/store/server/auth/mutation"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { useState, type FormEvent } from "react"
import logo from "@/assets/sky-land.png"

function safeRedirectPath(value: unknown) {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//")
  ) {
    return "/"
  }
  return value
}

export const Route = createFileRoute("/(auth)/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: safeRedirectPath(search.redirect),
  }),
  beforeLoad: ({ search }) => {
    if (useBoundStore.getState().token) {
      throw redirect({ href: search.redirect })
    }
  },
  component: LoginPage,
})

function LoginPage() {
  const { redirect: redirectTo } = Route.useSearch()
  const login = useLogin(redirectTo)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    login.mutate({ username, password })
  }

  return (
    <div className="grid min-h-svh grid-cols-1 bg-background md:grid-cols-2">
      <div className="relative hidden h-screen md:block">
        <div className="h-full w-full bg-gradient-to-br from-sky-200 via-cyan-50 to-lime-100" />
        <div
          style={{
            width: "100%",
            background:
              "linear-gradient(0deg, #000 30%, rgba(0, 0, 0, 0) 100%)",
            position: "absolute",
            zIndex: 20,
            bottom: 0,
            left: 0,
          }}
          className="h-1/4"
        >
          <div className="absolute bottom-6 left-6 text-white">
            <h2 className="text-lg font-semibold">Welcome To</h2>
            <p className="text-sm opacity-80">Skyland Tourism</p>
          </div>
        </div>
      </div>
      <div className="flex h-screen items-center justify-center bg-background">
        <Card className="w-full sm:max-w-md">
          <CardHeader>
            <CardTitle className="flex justify-center">
              <img
                src={logo}
                alt="Skyland Tourism"
                className="h-10.25 w-auto object-contain"
              />
            </CardTitle>
            <CardDescription className="text-center">
              Skyland Tourism
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form id="login-form" onSubmit={handleSubmit}>
              <FieldGroup className="gap-5">
                <Field className="gap-2">
                  <FieldLabel htmlFor="username">Username</FieldLabel>
                  <Input
                    id="username"
                    name="username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="Text"
                    autoComplete="off"
                    required
                  />
                </Field>
                <Field className="gap-2">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input
                    type="password"
                    id="password"
                    name="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Text"
                    autoComplete="off"
                    required
                  />
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
          <CardFooter className="border-t-0 bg-transparent">
            <Field orientation="horizontal">
              <Button
                type="submit"
                className="w-full cursor-pointer"
                form="login-form"
                disabled={login.isPending}
              >
                {login.isPending ? "Signing in..." : "Login"}
              </Button>
            </Field>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
