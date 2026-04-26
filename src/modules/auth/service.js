
/**
 * Application Module Tutorial:
 *
 * Ein Service führt logik aus. Hier wird also geschaut ob username und passwort mitgeschickt wurden,
 * ob der user existiert und wenn ja, ob sein passwort übereinstimmt.
 * Um daten zu speichern brauchen wir noch die letzte layer, die persistence layer.
 * */

export function authenticateUser(username, password, auth) {

    return {
        success: true,
        token: "asdf"
    }
}