import LoginForm from './LoginForm'

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <h1 className="mb-6 text-center text-2xl font-bold">QR 盤點系統登入</h1>
      <LoginForm />
    </main>
  )
}
