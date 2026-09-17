import RegisterForm from './RegisterForm'

export default function RegisterPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <h1 className="mb-6 text-center text-2xl font-bold">註冊新帳號</h1>
      <RegisterForm />
    </main>
  )
}
