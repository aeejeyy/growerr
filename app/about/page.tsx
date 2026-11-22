'use client';
import { useState } from 'react';
import { clearAll, exportData, exportRawData, StorageProblem } from '../../lib/storage';
import { downloadJson } from '../../lib/download';
import { nonAdvice } from '../../lib/content';
import ConfirmDialog from '../../components/ConfirmDialog';
export default function About() {
  const [confirm, setConfirm] = useState(false); const [message, setMessage] = useState('');
  function exportMine() { try { downloadJson(exportData(), 'growerr-data.json'); setMessage('Your data export has started.'); } catch (error) {
    if (error instanceof StorageProblem) { try { downloadJson(exportRawData(), 'growerr-recovery.json'); setMessage('Saved data could not be read, so the original stored text was exported for recovery.'); } catch { setMessage('Could not access browser storage to export the data.'); } }
    else setMessage('Could not export the data. Please try again.');
  } }
  function removeAll() { try { clearAll(); setConfirm(false); setMessage('Your Growerr data was removed from this browser.'); } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not remove the data.'); } }
  return <div className="page narrow article"><div className="eyebrow">Methodology & privacy</div><h1>What Growerr does — and does not do</h1><h2>A place to reflect, not a financial adviser</h2><p>{nonAdvice} The percentage illustrations show arithmetic only: they are not forecasts, expected outcomes or the most you could lose. A stock can lose its entire invested value.</p>
    <h2>Where this idea comes from</h2><p>This prototype is informed by one person’s self-reported first investment experience and by product hypotheses. It is not evidence that all new investors have the same needs, nor a validated solution. The example journey is fictional and labelled synthetic; it is not an interview transcript or live market data.</p>
    <h2>Your data stays in this browser</h2><p>Decisions and drafts are saved in this browser’s local storage. We do not request names, PAN, bank details, brokerage credentials or exact holdings. Please do not put account identifiers in free-text fields. There is no account, cloud sync, encryption claim or backup: another device cannot retrieve your records, and clearing browser data can remove them.</p>
    <div className="data-actions"><h2>Manage your data</h2><p>Download your records as JSON before clearing this browser if you want to keep a copy.</p><div className="actions"><button className="button secondary" onClick={exportMine}>Export my data</button><button className="button danger-outline" onClick={() => setConfirm(true)}>Delete all my data</button></div><p role="status" className="status">{message}</p></div>
    {confirm && <ConfirmDialog title="Delete all Growerr data?" description="This removes saved snapshots and your unfinished draft from this browser. It cannot be undone." confirmLabel="Delete all data" onCancel={() => setConfirm(false)} onConfirm={removeAll} />}
    </div>;
}
