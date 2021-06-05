import axios from "axios"
import type { AxiosInstance } from "axios";
import { derived, Readable, Writable, writable } from "svelte/store";
import { readTokensFromLocalStorage, Tokens } from "./pkce";

export let tokens: Writable<Tokens> = writable(readTokensFromLocalStorage())

export let spotify: Readable<AxiosInstance> = derived(tokens, (tokens, set) => set(axios.create({
	baseURL: "https://api.spotify.com/v1/",
	headers: {
		Authorization: `Bearer ${tokens.access}`
	}
})))
