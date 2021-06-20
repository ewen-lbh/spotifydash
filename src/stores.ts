import axios from "axios"
import type { AxiosInstance } from "axios"
import { derived, Readable, Writable, writable } from "svelte/store"
import { readTokensFromLocalStorage, refreshToken, Tokens } from "./pkce"
import type { SimplifiedArtist, SavedTrack } from "./types"

export let tokens: Writable<Tokens> = writable(readTokensFromLocalStorage())

export let spotify: Readable<AxiosInstance> = derived(
	tokens,
	(currentTokens, set) => {
		let instance = axios.create({
			baseURL: "https://api.spotify.com/v1/",
			headers: {
				Authorization: `Bearer ${currentTokens.access}`,
			},
		})
		instance.interceptors.response.use(
			response => response,
			async error => {
				if (error.response.status === 429) {
					console.log(error.response)
					let cooldown = parseInt(error.response.headers["retry-after"]) + 0.25
					console.info(`Cooling down: waiting for ${cooldown} seconds`)
					await new Promise(r => setTimeout(r, cooldown * 1000))
					return axios(error.response.config)
				} else if (error.response.status === 401) {
					let newTokens = await refreshToken(currentTokens)
					error.response.config.headers.Authorization = `Bearer ${newTokens.access}`
					tokens.set(newTokens)
					return axios(error.response.config)
				} else {
					Promise.reject(error)
				}
			}
		)
		set(instance)
	}
)

export let followedArtists: Writable<SimplifiedArtist[]> = writable([])

export let library: Writable<SavedTrack[]> = writable([])
