const env = {
  APIURL:process.env.NODE_ENV == "develoment"? "http://127.0.0.1:3000/api" : "http://127.0.0.1:3000/api"
}

export {env}