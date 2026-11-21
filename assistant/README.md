# Accountias AI-assistent

Hugo-nettsiden publiseres på GitHub Pages. Denne mappen er et eget Vercel-prosjekt som bruker de offentlige svarene på den publiserte nettsiden. Fritekstfunksjonen på nettsiden fungerer lokalt når agenten er frakoblet.

Bruk `assistant` som rotmappe i et Vercel-prosjekt for kommersiell bruk. Aktiver Vercel OIDC i prosjektet og velg en modell i AI Gateway. Sett `ACCOUNTIA_GATEWAY_MODEL` til modellens identifikator i Vercel. Sett et prosjektbudsjett i AI Gateway og en IP-basert ratebegrensning for POST til `/api/chat` i Vercel Firewall. Gjennomgå personvernteksten for chatten før aktivering.

Når dette er gjort, sett `ACCOUNTIA_AGENT_ENABLED` til `1` i prosjektet. Test agenten med en POST-forespørsel fra `https://acountia.no` og en JSON-kropp med `lang` og `question`. Legg produksjonsadressen til `/api/chat` i Hugos `[params]` som `assistantEndpoint`. Nettleseren går tilbake til lokale svar hvis agenten er midlertidig utilgjengelig.
