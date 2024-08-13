/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
	  domains: ["oaidalleapiprodscus.blob.core.windows.net"],
	},
	experimental: {
	  fontLoaders: [
		{
		  loader: '@next/font',
		  options: {
			google: {
			  families: ['Montserrat:wght@600'],
			},
		  },
		},
	  ],
	},
  };
  
  module.exports = nextConfig;