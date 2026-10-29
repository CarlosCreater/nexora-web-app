
export default function AdminLogin() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md space-y-5 rounded-2xl bg-white p-8 text-center shadow-lg">
        <h1 className="text-3xl font-bold tracking-widest text-gray-800">
          CARLO'S
        </h1>

        <p className="text-sm text-gray-500">
          Painel administrativo — demonstração
        </p>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
          <h2 className="text-lg font-semibold text-gray-800">
            Acesso restrito
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            O painel administrativo está disponível apenas para demonstração
            técnica. O acesso não está habilitado nesta versão pública.
          </p>
        </div>

        <a
          href="/"
          className="block w-full rounded-lg bg-gray-900 p-3 font-semibold text-white hover:bg-gray-700"
        >
          Voltar para a loja
        </a>
      </div>
    </main>
  );
}
