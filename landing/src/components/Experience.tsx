import event from "@/data/event.json";
import Image from "next/image";
import type { Guest } from "@/lib/guests.server";
import LoveIssue from "./LoveIssue";
import { getStories } from "@/lib/stories.server";
import InvitationImage from "./InvitationImage";
import InvitationGate, { HistoryGate } from "./InvitationGate";
import { getSiteUrl, getGuestUrl } from "@/lib/site-url.mjs";
import { assetPath } from "@/lib/asset-path";
import ChapterNavigation from "./ChapterNavigation";
import styles from "./Experience.module.css";

const chapters = [
  ["carta", "Carta cerrada"], ["apertura", "Apertura"], ["saludo", "Saludo"],
  ["video", "The Love Issue"], ["historia", "Nuestra historia"], ["2008", "2008"],
  ["2022", "2022"], ["2026", "2026"], ["invitacion", "La invitación"],
  ["ceremonia", "Ceremonia"], ["dress-code", "Dress code"], ["puerto-velero", "Puerto Velero"],
  ["postboda", "8 de diciembre"], ["confirmacion", "Confirmación"], ["cierre", "Cierre"],
];

export default async function Experience({ guest, initialOpened = false }: { guest: Guest; initialOpened?: boolean }) {
  const stories = await getStories(guest);
  const showPostWedding = guest.postWeddingAccess === true;
  const publicUrl = guest.slug === "default" ? null : getGuestUrl(getSiteUrl(), guest.slug);
  const seatsLabel = guest.seats === null ? guest.seatsPendingLabel ?? "Sin asignación" : String(guest.seats);
  const message = event.rsvp.message.replace("{guest}", guest.displayName);
  const whatsapp = `https://wa.me/${event.rsvp.phoneInternational}?text=${encodeURIComponent(message)}`;
  const locationSearch = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${event.location.name}, ${event.location.region}`)}`;

  return (
    <InvitationGate key={guest.slug} initialOpened={initialOpened}
      readingUrl={assetPath(guest.slug === "default" ? "/lectura/#saludo" : `/${guest.slug}/lectura/#saludo`)} letter={{
      couple: event.couple, date: event.dateEditorial, recipient: guest.displayName, greeting: guest.greeting,
      seatsLabel, note: event.letter.openingNote, location: `${event.location.name}, ${event.location.region}`,
    }}>
      <a className={styles.skipLink} href="#saludo">Saltar al contenido de la carta</a>
      <header className={styles.navigation}>
        <a href="#carta" className={styles.wordmark} aria-label="Luis y Marie, volver a la carta">L &amp; M</a>
        <ChapterNavigation chapters={chapters} />
        <a className={styles.navRsvp} href="#confirmacion">Confirmar</a>
      </header>
      <main>
        <section id="saludo" data-scene="saludo" className={`${styles.scene} ${styles.greeting}`} aria-labelledby="saludo-heading">
          <div className={styles.letterMargin} aria-hidden="true">Luis &amp; Marie<br />Diciembre, 2026</div>
          <div className={styles.readingColumn}>
            <h2 id="saludo-heading" tabIndex={-1}>{guest.greeting}</h2>
            <p className={styles.seats} data-seats>Cupos: {seatsLabel}</p>
            <p>{event.letter.intro}</p>
            <p className={styles.dedication} data-ink>{event.letter.dedication}</p>
            <span className={styles.signature}>{event.couple}</span>
          </div>
        </section>

        <section id="video" data-scene="video" className={`${styles.scene} ${styles.videoScene}`} aria-labelledby="video-heading">
          <LoveIssue content={stories} />
        </section>

        <HistoryGate>
        <section id="historia" data-scene="historia" className={`${styles.scene} ${styles.historyIntro}`} aria-labelledby="historia-heading">
          <p>Una memoria compartida</p>
          <h2 id="historia-heading" data-ink>Nuestra<br />historia</h2>
          <p>{event.letter.historyIntro}</p>
          <span className={styles.historyRange}>2008 — 2026</span>
        </section>

        <div className={styles.memoryBook}>
          {event.story.map((chapter, index) => (
            <section id={chapter.year} data-scene={chapter.year} key={chapter.year}
              className={`${styles.memorySpread} ${index === 1 ? styles.reverseSpread : ""} ${index === 2 ? styles.finalSpread : ""}`}
              aria-labelledby={`heading-${chapter.year}`}>
              <div className={styles.yearPage}>
                <h2 id={`heading-${chapter.year}`} className={styles.year} data-ink>{chapter.year}</h2>
                <p>{chapter.footnote}</p>
              </div>
              <div className={styles.memoryText}>
                <h3>{chapter.title}</h3>
                <p>{chapter.text}</p>
                {chapter.photo ? (
                  <div className={styles.memoryPhoto}>
                    <Image src={assetPath(chapter.photo)} alt={`Recuerdo de Luis y Marie, ${chapter.year}`} fill
                      sizes="(min-width: 960px) 480px, calc(100vw - 40px)" />
                  </div>
                ) : null}
                {index === 2 ? <p className={styles.memorySignature}>{event.couple}</p> : <span className={styles.memoryRule} aria-hidden="true" />}
              </div>
            </section>
          ))}
        </div>

        <section id="invitacion" data-scene="invitacion" className={`${styles.scene} ${styles.invitationScene}`} aria-labelledby="invitacion-heading">
          <div className={styles.invitationCopy}>
            <p>El encuentro</p>
            <h2 id="invitacion-heading" tabIndex={-1}>{event.letter.invitation}</h2>
            <p className={styles.eventDate}><time dateTime={event.date}>{event.dateLabel}</time></p>
            <p>{event.location.name}, {event.location.region}</p>
            <p className={styles.small}>Llegada {event.agenda[0].time} · Ceremonia {event.agenda[1].time}</p>
            <p className={styles.editorNote}>El facsímil conserva su impresión original. Consulta la agenda preliminar de esta edición para distinguir llegada y ceremonia.</p>
            <a className={styles.quietLink} href="#ceremonia">Consultar la agenda</a>
          </div>
          <div className={styles.invitationObject}><InvitationImage /></div>
        </section>

        <section id="ceremonia" data-scene="ceremonia" className={`${styles.scene} ${styles.ceremony}`} aria-labelledby="ceremonia-heading">
          <div className={styles.agendaHeading}>
            <p><time dateTime={event.date}>{event.dayLabel}</time></p>
            <h2 id="ceremonia-heading">La ceremonia<br />y la celebración</h2>
            <p>{event.location.name}, {event.location.region}</p>
            <p className={styles.editorNote}>Agenda preliminar. La hora final está por confirmar.</p>
          </div>
          <ol className={styles.agenda}>{event.agenda.map((item) => (
            <li key={item.label}>
              <span className={styles.agendaTime}>{item.time ?? "Por confirmar"}</span>
              <span>{item.label}</span>
            </li>
          ))}</ol>
        </section>

        <section id="dress-code" data-scene="dress-code" className={`${styles.scene} ${styles.dressCode}`} aria-labelledby="dress-heading">
          <div className={styles.linenPanel} aria-hidden="true"><span>Blanco<br />sobre blanco.</span></div>
          <div className={styles.dressCopy}>
            <p>Dress code</p>
            <h2 id="dress-heading">{event.dressCode.title}</h2>
            <p>{event.dressCode.text}</p>
            <p className={styles.fabricNote}>{event.dressCode.note}</p>
          </div>
        </section>

        <section id="puerto-velero" data-scene="puerto-velero" className={`${styles.scene} ${styles.location}`} aria-labelledby="location-heading">
          <p>El lugar del encuentro</p>
          <h2 id="location-heading">Puerto<br />Velero</h2>
          <div className={styles.locationDetails}>
            <p>{event.location.region}</p>
            {!event.location.photo || !event.location.exactMapUrl ? (
              <p className={styles.editorNote}>Los materiales y datos pendientes del lugar serán incorporados en la próxima edición.</p>
            ) : null}
            <a className={styles.button} href={event.location.exactMapUrl ?? locationSearch} target="_blank" rel="noopener noreferrer">
              {event.location.exactMapUrl ? "Ver ubicación" : "Explorar la zona en Maps"}
              <span className={styles.srOnly}> (abre una pestaña nueva)</span>
            </a>
            {!event.location.exactMapUrl ? <p className={styles.small}>Búsqueda general, no es el pin del evento.</p> : null}
          </div>
          {event.location.photo ? (
            <div className={styles.locationPhoto}>
              <Image src={assetPath(event.location.photo)} alt="Puerto Velero, lugar del encuentro" fill
                sizes="(min-width: 960px) 1120px, calc(100vw - 40px)" />
            </div>
          ) : null}
        </section>

        <section id="postboda" data-scene="postboda" className={`${styles.scene} ${styles.morning}`} aria-labelledby="morning-heading">
          <div className={styles.morningHeading}>
            <p><time dateTime={event.postWedding.date}>{event.postWedding.dateLabel}</time></p>
            <h2 id="morning-heading">{event.postWedding.title}</h2>
            <p>Un encuentro íntimo para {event.postWedding.audience.toLowerCase()}.</p>
          </div>
          {showPostWedding ? (
            <ol className={styles.agenda}>{event.postWedding.agenda.map((item) => (
              <li key={item.time}><span className={styles.agendaTime}>{item.time}</span><span>{item.label}</span></li>
            ))}</ol>
          ) : <p className={styles.previewNote}>Este encuentro está previsto para padres y hermanos. {guest.postWeddingAccess === false ? "Esta invitación no incluye acceso a la postboda." : "El acceso de esta invitación está pendiente de asignación."}</p>}
        </section>

        <section id="confirmacion" data-scene="confirmacion" className={`${styles.scene} ${styles.confirmation}`} aria-labelledby="confirmation-heading">
          <p>De vuelta a ustedes</p>
          <h2 id="confirmation-heading">¿Nos acompañas?</h2>
          <p>{event.letter.confirmation}</p>
          <p className={styles.seats}>Cupos: {seatsLabel}</p>
          <a className={styles.button} href={whatsapp} target="_blank" rel="noopener noreferrer">
            Confirmar por WhatsApp<span className={styles.srOnly}> (abre una pestaña nueva)</span>
          </a>
          <a className={styles.phone} href={`tel:+${event.rsvp.phoneInternational}`}>{event.rsvp.phoneDisplay}</a>
          <p className={styles.editorNote}>El botón prepara un mensaje. Tu asistencia se confirma al enviarlo y recibir respuesta, no al abrir WhatsApp.</p>
          <a className={styles.quietLink} href={`mailto:${event.rsvp.email}?subject=${encodeURIComponent(`Confirmación ${event.couple}`)}`}>También puedes escribirnos por correo</a>
        </section>

        <section id="cierre" data-scene="cierre" className={`${styles.scene} ${styles.closing}`} aria-labelledby="closing-heading">
          <div className={styles.closingLines} data-ink>{event.letter.closing.map((line) => <p key={line}>{line}</p>)}</div>
          <h2 id="closing-heading">{event.couple}</h2>
          <p>{event.dateEditorial}</p>
          <p>{event.location.name}</p>
          <div className={styles.closingLinks}>
            <a href="#invitacion">Volver a los detalles</a>
            <a href="#confirmacion">Confirmar asistencia</a>
          </div>
          {guest.slug !== "default" ? (
            <details className={styles.guestQr}>
              <summary>El enlace de tu carta</summary>
              {publicUrl ? (
                <div className={styles.qrContent}>
                  <Image src={assetPath(`/qr/qr-${guest.slug}.png`)} alt={`QR de la carta para ${guest.displayName}`}
                    width={256} height={256} unoptimized />
                  <a href={publicUrl}>{publicUrl}</a>
                  <div className={styles.closingLinks}>
                    <a href={assetPath(`/qr/qr-${guest.slug}.svg`)} download={`qr-${guest.slug}.svg`}>Descargar SVG</a>
                    <a href={assetPath(`/qr/qr-${guest.slug}.png`)} download={`qr-${guest.slug}.png`}>Descargar PNG</a>
                  </div>
                </div>
              ) : <p className={styles.editorNote}>El enlace público y su QR están pendientes de configurar. No se ha generado un código de impresión con una dirección provisional.</p>}
            </details>
          ) : null}
        </section>
        </HistoryGate>
      </main>
      <footer className={styles.footer}><p>The Letter · {event.stage}</p><p>Una carta para recorrer y conservar.</p></footer>
    </InvitationGate>
  );
}
