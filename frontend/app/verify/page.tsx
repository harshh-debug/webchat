import Loading from "@/components/Loading"
import VerifyOtp from "@/components/VerifyOtp"
import { hasAuthCookie } from "@/lib/auth-cookies"
import { redirect } from "next/navigation"
import { Suspense } from "react"

const page = async () => {
  if (await hasAuthCookie()) redirect("/chat")

  return (
	<Suspense fallback={<Loading></Loading>}>
	  <VerifyOtp></VerifyOtp>
	</Suspense>
  )
}

export default page
