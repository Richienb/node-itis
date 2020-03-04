import ky from "ky-universal"
import mem from "mem"
import { Options } from "ky"

// API Documentation: https://services.w3.org/xslt?xslfile=https://tomi.vanek.sk/xml/wsdl-viewer.xsl&amp;xmlfile=https://www.itis.gov/ITISWebService/services/ITISService?wsdl

async function request(endpoint: string, options: Options["searchParams"]) {
	return await ky(`https://www.itis.gov/ITISWebService/jsonservice/ITISService/${endpoint}`, {
		searchParams: new URLSearchParams(Object.entries(options)),
		timeout: false
	}).json()
}

export = mem(request, {
	maxAge: 600000
})
