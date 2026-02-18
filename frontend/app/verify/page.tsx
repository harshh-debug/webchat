import Loading from "@/components/Loading"
import VerifyOtp from "@/components/VerifyOtp"
import { Suspense } from "react"

const page = () => {
  return (
	<Suspense fallback={<Loading></Loading>}>
	  <VerifyOtp></VerifyOtp>
	</Suspense>
  )
}

export default page
