
# Authentifizierung

Dieses Modul ist Teil der Web-security. In unserer Anwendung gibt es `Resourcen` die öffentlich zugänglich sein sollten und manche die nur Personal der Organisation zugänglich sein sollten. Um diese Resourcen zu schützen, müssen wir jeden **HTTP Request** überprüfen. Wir machen das, indem wir den User auffordern (challenge) etwas das nur der User weiß (email + passwort) mitzusenden. Besteht der User die challenge (es existiert ein user mit dieser email und das passwort stimmt überein) so darf der User auf die Resource zugreifen.

Damit der User aber nicht bei jedem Request seine email und Passwort neu eintippen muss, verwenden wir einen Authentifizierungstoken der **einmal** beim Login hergegeben wird. Dieser Token verleiht dem Request bestimmte Privilegien. In unserem Fall verwenden wir **RBAC** also rollenbasierte Zugriffskontrolle. Alle Rollen können in `auth/roles.js` gefunden werden.  

## auth/routes.js

Hier werden alle **HTTP endpoints** des Authentifizierungsmoduls registriert.

### Routen

```POST /api/auth```

Der Client sendet einen `POST` request zum endpoint um sich anzumelden. Der HTTP Body muss `email` und `passwort` als JSON enthalten. Beispiel Payload:

```json
{"email":"peter@mail.com","password":"passwort"}
```

## auth/controllers.js

### Response codes:

[Mozilla HTTP Response Codes liste](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status)

| Status | Bedeutung                                                                 |
|--------|---------------------------------------------------------------------------|
| `204`  | Erfolgreicher login                                                       |
| `400`  | Schlechter Request (daten fehlen, JSON ist nicht gültig, etc.)            |
| `401`  | Der Request hat gepasst aber die Authentifizierung hat nicht funktioniert |

### Auth Cookies

Unser Authentifizierungstoken wird in `Cookies` gespeichert. 

Folgende Flags müssen verwendet werden:
- `httpOnly`: `true` der Eintrag kann nicht von JavaScript am frontend gelesen werden
- `secure`: `true` der Eintrag wird nur über **HTTPS** (verschlüsselt) übertragen, sonst könnte er von anderen gelesen werden. Hinweis: bei uns wird diese Flag im `development` modus ignoriert, sodass wir das System auch über HTTP (unverschlüsselt) testen können.
- `sameSite`: `strict` der Eintrag wird nur an dieselbe Website geschickt (nicht an andere Seiten)

## auth/services.js

Der Service `authenticateUser` überprüft, ob es einen User mit der email gibt und wenn ja, ob das Passwort übereinstimmt. 

Wichtig: Die übergebenen Parameter sollten immer überprüft werden, auch wenn sie bereits von den Controllern überprüft werden.

### Hashing

Die gespeicherten Passwörter müssen immer gehasht werden. Wir verwenden den eingebauten Algorithmus `scrypt` vom `NodeJS` Modul `node:crypto`.

[Scrypt Wikipedia](https://de.wikipedia.org/wiki/Scrypt)

[NodeJS crypto.scrypt](https://nodejs.org/api/crypto.html#cryptoscryptpassword-salt-keylen-options-callback)

**Parameter:**
- Algorithmus: `scrypt`
- Schlüssellänge: 64 bytes
- Salt-länge: 16 bytes

### JWT (JSON Web Token)

[Details](https://www.jwt.io/)

**Parameter:**
- Algorithmus: `HS256` (HMAC + SHA256)
- Gültigkeitsdauer: 24 Stunden (60 * 60 * 24 Sekunden)

Das JWT Secret soll allgemein nur über den `auth/secret-provider.js` erlangt werden. Im Moment ist dieser implementiert, indem er eine ENV Variable liest. 

## auth/persistence.js

Als ich diese Dokumentation geschrieben habe, war das Credentials Domain Entity in `persitence.js` definiert. Das ist zwar nicht optimal, da wir aber zu dem Zeitpunkt kein `Typescript` verwendet hatten, ist dies auch nicht weiters bedenklich. 

`findCredentialsByEmail`:
Findet eine SQLite `row` und mapped diese in ein UserCredentials Domain Entity. 

