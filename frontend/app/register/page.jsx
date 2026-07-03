import Navbar from "@/components/Navbar";
import AuthForm from "@/components/AuthForm";

export default function RegisterPage() {
  return (
    <>
      <Navbar />
      <main className="px-6 py-20">
        <AuthForm mode="register" />
      </main>
    </>
  );
}
