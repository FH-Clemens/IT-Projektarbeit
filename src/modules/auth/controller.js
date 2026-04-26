import {findByUsername} from "./repository.js";


/**
 * Application Module Tutorial:
 *
 * Ein Controller trennt HTTP (presentation) von Anwendung.
 * Dadurch kann die Anwendung Protokoll unabhängig funktionieren.
 * Hier werden parameter aus dem HTTP body entnommen und dem Authentifizierungsservice übergeben.
 * Auch eine ordentliche HTTP response wird vom Controller zurückgeschickt.
 * */

export async function login(req, res) {

}