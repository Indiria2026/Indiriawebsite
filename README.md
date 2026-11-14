# INDIRIA — sito pronto per GitHub e dominio

Esportazione del 14 novembre 2026, dalla versione 29 del sito, corretta per l’apertura diretta da file.
Include il ritaglio aggiornato della miniatura Gomiti, senza volto né lampadario, con il contorno del gomito visibile. Include le FAQ aggiornate sullo stato emotivo, sullo stress e sulla costanza nelle indicazioni d’uso della crema. Include italiano, inglese e cinese semplificato; selettore IT / EN / 中文 sempre visibile, anche su smartphone; schede prodotto interattive; esplorazione per area del corpo; confronti fotografici per giorno; fotografie originali di mani, gomiti e piedi con zoom e trascinamento nei riquadri; domande frequenti. La sequenza delle mani comprende i giorni 1, 3 e 7.

La lingua scelta viene ricordata nel browser. Tutte le immagini, le traduzioni e i font necessari sono inclusi: non serve collegarsi alla copia privata su ChatGPT Sites.

Il sito è statico: HTML, CSS e JavaScript. Non richiede compilazione, Node.js, database o credenziali ChatGPT. Il contatto avviene tramite i collegamenti email e telefono.

## Aprire il sito sul computer

1. Estrarre **tutto** lo ZIP in una cartella nuova. Non aprire i file mentre sono ancora dentro lo ZIP.
2. Aprire `index.html` in un browser aggiornato. I pulsanti **IT / EN / 中文** sono visibili nella testata anche senza aprire il menu.
3. La copia usa script classici già inclusi (`site.js` ed `effects.js`): traduzioni, schede prodotto e zoom non dipendono dal caricamento di moduli ES via `file://`. La memorizzazione della lingua resta subordinata alle impostazioni del browser.

## 1. Caricare il sito su GitHub

1. Estrarre lo ZIP e aprire la cartella `INDIRIA-GitHub-v29`.
2. Nella repository GitHub destinata al sito, scegliere **Add file → Upload files**.
3. Caricare il contenuto della cartella estratta, mantenendo la cartella `assets` e le sue sottocartelle. `index.html` deve trovarsi direttamente nella radice della repository: non caricare lo ZIP o una cartella esterna aggiuntiva.
4. Includere anche il file `.nojekyll`, eventualmente abilitando la visualizzazione dei file nascosti. In alternativa, crearlo vuoto dalla repository.
5. Confermare con **Commit changes** sul branch `main`, oppure sul branch scelto per il sito.

Per sostituire un sito già presente, usare preferibilmente il clone locale della repository: aggiornare i file, controllare le modifiche e fare commit e push. Conservare l'eventuale `CNAME` già configurato per il proprio dominio.

## 2. Attivare GitHub Pages

Aprire **Settings → Pages → Build and deployment** e impostare:

| Impostazione | Valore |
| --- | --- |
| Source | Deploy from a branch |
| Branch | main, o il branch su cui sono stati caricati i file |
| Folder | /(root) |

Salvare e attendere il completamento della pubblicazione. Il collegamento al sito compare nella pagina delle impostazioni Pages. Se Pages non è disponibile, verificare i permessi sulla repository e la disponibilità per il proprio piano GitHub.

## 3. Collegare il dominio

Servono il dominio scelto, l'accesso alla gestione DNS e i permessi amministrativi sulla repository.

1. In **Settings → Pages → Custom domain**, inserire il dominio effettivo e salvare, prima di modificare i DNS. GitHub aggiungerà il file `CNAME` alla repository.
2. Nel pannello DNS del dominio configurare i record pertinenti:

| Destinazione | Tipo | Nome | Valore |
| --- | --- | --- | --- |
| Dominio principale | A | @ | 185.199.108.153 |
| Dominio principale | A | @ | 185.199.109.153 |
| Dominio principale | A | @ | 185.199.110.153 |
| Dominio principale | A | @ | 185.199.111.153 |
| www | CNAME | www | NOME-ACCOUNT.github.io |

Sostituire `NOME-ACCOUNT` con l'utente o l'organizzazione proprietaria della repository. Nel valore CNAME non inserire `https://` né il nome della repository. Conservare i record della posta elettronica.

3. Quando GitHub conferma la configurazione, attivare **Enforce HTTPS**. La propagazione DNS può richiedere fino a 24 ore.

Il dominio non era stato indicato al momento dell'esportazione: questo pacchetto non contiene un `CNAME` precompilato.

## 4. Ultimi controlli sul dominio definitivo

- In `index.html`, impostare `og:image` con l'URL HTTPS completo dell'immagine sul proprio dominio, seguito da `/assets/hero-panoramica.webp`. Nell'esportazione il percorso è relativo, per evitare dipendenze dal precedente indirizzo del sito.
- Aprire il sito su computer e smartphone. Controllare il selettore IT / EN / 中文 senza aprire il menu; il cambio lingua anche nelle schede prodotto; i confronti tra giorni; zoom e trascinamento delle fotografie; le FAQ e i collegamenti di contatto.
- Le modifiche future fatte in ChatGPT Sites non si trasferiscono automaticamente a questa copia: occorre esportarle e aggiornare la repository.

È possibile anche usare un’anteprima via HTTP: se Python è installato, eseguire nella cartella `python -m http.server 8000`, poi aprire `http://localhost:8000`. Prima di collegare il dominio, effettuare un ultimo controllo sul vostro hosting.

## Modifiche ai file JavaScript

`index.html` carica `site.js` (funzioni del sito) ed `effects.js` (animazioni). Sono già pronti: non occorre una compilazione per visualizzare o pubblicare il sito. Per lavorare sui sorgenti modulari inclusi, modificare i file originali e poi eseguire `python build-portable.py`; il comando rigenera entrambi i file caricati dalla pagina. Per modifiche a HTML, CSS e immagini non occorre rigenerare i bundle.

## Hosting alternativo

I medesimi file possono essere caricati nella directory pubblica di un hosting statico. La cartella da pubblicare è quella che contiene `index.html`; non occorre un comando di build. In questo caso usare i DNS indicati dal proprio hosting, anziché quelli di GitHub Pages.

## Verifica di questa esportazione

- Contenuti, immagini e traduzioni della versione 29. La copia portabile usa `site.js` ed `effects.js`, mostra subito il selettore e usa un percorso relativo per `og:image`.
- Riferimenti locali a immagini, stili e moduli JavaScript controllati. Archivio ZIP verificato.
- Il bundle portabile è stato verificato in una simulazione DOM con indirizzo `file://`, caricamento di moduli disabilitato e nessuna richiesta di rete: cambio IT/EN/中文, schede prodotto, confronti e zoom superano i controlli. Il controllo visivo nel browser non è stato completato in questo ambiente: prima del lancio, verificare l’anteprima sul vostro hosting.

## Riferimenti ufficiali

- [Sorgente di pubblicazione GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [Configurazione del dominio](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
- [HTTPS](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https)

Riferimento tecnico della copia: commit `bce7de2aef81605d45e73c0ee422ef71c1f6091a`. Le licenze dei font e dei componenti distribuiti si trovano in `assets`.
