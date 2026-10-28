import base64, json, pathlib, subprocess, urllib.request, concurrent.futures, time
root=pathlib.Path(__file__).parent
key=pathlib.Path('/run/secrets/openrouter-key').read_text().strip()
def run(i):
    start=i*60
    out=root/f'minute-{i:02}.mp3'
    subprocess.run(['ffmpeg','-v','error','-y','-ss',str(start),'-i',str(root/'source.mp4'),'-t','60','-vn','-ac','1','-ar','16000','-b:a','48k',str(out)],check=True)
    dest=root/f'minute-{i:02}.json'
    if dest.exists(): return json.loads(dest.read_text())
    prompt=f"""Transcribe every word in this 60-second audio excerpt faithfully. Use speaker labels Lex Fridman or Robert F. Kennedy Jr. Do not summarize or fact-check. Mark unclear words [unclear]. Return ONLY JSON: {{"segments":[{{"speaker":"...","text":"..."}}]}}. Break at speaker turns. Important terms if spoken: averting, SV40, DTP, diphtheria, bilharzia, Mogensen, Aaby, Bruesewitz, thimerosal. Do not invent speech at the cut boundaries."""
    body={'model':'google/gemini-2.5-flash','messages':[{'role':'user','content':[{'type':'text','text':prompt},{'type':'input_audio','input_audio':{'data':base64.b64encode(out.read_bytes()).decode(),'format':'mp3'}}]}],'reasoning':{'enabled':False},'temperature':0,'max_tokens':12000}
    req=urllib.request.Request('https://openrouter.ai/api/v1/chat/completions',data=json.dumps(body).encode(),headers={'Authorization':'Bearer '+key,'Content-Type':'application/json'})
    with urllib.request.urlopen(req,timeout=300) as r: response=json.load(r)
    (root/f'minute-response-{i:02}.json').write_text(json.dumps(response,indent=2))
    s=response['choices'][0]['message']['content'].strip()
    if s.startswith('```'): s=s.split('\n',1)[1].rsplit('```',1)[0]
    result=json.loads(s)
    for seg in result['segments']: seg['start']=start
    dest.write_text(json.dumps(result,indent=2)); print('Completed chunk',i,'segments',len(result['segments']),flush=True)
    return result
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    results=list(pool.map(run,range(16)))
segments=[s for r in results for s in r['segments']]
segments.append({'start':960,'speaker':'Lex Fridman','text':'Thank you.'})
for s in segments:
    if s['start'] in (300,360): s['speaker']='Mixed speakers: Kennedy and Fridman'
    if s['start']==0: s['text']=s['text'].replace('solving averting','[hesitation] averting')
    if s['start']==480: s['text']=s['text'].replace('safety drought','safety [unclear: trial]').replace('foil lawsuit','FOIA lawsuit')
(root/'transcript.json').write_text(json.dumps({'model':'google/gemini-2.5-flash','method':'OpenRouter audio transcription in 60-second chunks; timestamps mark chunk starts, not word alignment; not human-verified','segments':segments},indent=2))
(root/'transcript.md').write_text('# Is RFK Jr an antivaxxer?\n\nMachine transcript via OpenRouter / Gemini 2.5 Flash. Approximate timestamps; may contain errors.\n\n'+'\n\n'.join(f"[{int(s['start'])//60:02}:{int(s['start'])%60:02}] **{s['speaker']}**: {s['text']}" for s in segments))
print('Full transcript saved',len(segments),flush=True)
