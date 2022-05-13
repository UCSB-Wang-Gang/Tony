import { Accordion, AccordionDetails, AccordionSummary, Box, Container, TextField, Typography } from '@mui/material';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { useEffect, useRef, useState } from 'react';
import './App.css';
import {CustomButton} from './components/CustomButton'

function App() {
  const [hitId, setHitId] = useState(-1);
  const [cause, setCause] = useState('cause');
  const [effect, setEffect] = useState('effect');
  const [question, setQuestion] = useState('question');
  const [passage, setPassage] = useState('passage');
  const [article, setArticle] = useState('article');

  const [worker_id, setWorkerId] = useState('worker_id');
  const [worker_hits, setWorkerHits] = useState('worker_hits');
  const [worker_status, setWorkerStatus] = useState('worker_status');
  const [good_count, setGoodCount] = useState('good_count');
  const [bad_count, setBadCount] = useState('bad_count');
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef();


  const handleError = () => {
    setCause('Error retrieving next hit (maybe DB empty?)');
    setEffect('Error retrieving next hit (maybe DB empty?)');
    setQuestion('Error retrieving next hit (maybe DB empty?)');
    setPassage('Error retrieving next hit (maybe DB empty?)');
  }

  const getHit = () => {
    fetch('https://the.mturk.monster:50000/api/get_hit/null/info')
      .then(r => r.json())
      .then(r => {
		if (r.error) {
          handleError();
        }

        setHitId(r.hit.id);
        setCause(r.hit.cause);
        setEffect(r.hit.effect);
        setQuestion(r.hit.question);

        const c_patterns = ['because', 'Because', 'due to', 'Due to', 'therefore', 'Therefore', 'consequently', 'Consequently', 'resulted in', 'Resulted in', 'Resulting in', 'resulting in', 'as a result', 'As a result'];
        const passage = r.hit.passage;
        let final_passage = passage;
        for (var i = 0; i < c_patterns.length; i++) {
          if (passage.includes(c_patterns[i])) {
            var highlight = "<span style='background-color:#FFFF00'>" + c_patterns[i] + "</span>";
            final_passage = final_passage.replace(c_patterns[i], highlight);
          }
        }
        setPassage(final_passage);

        const article_url = "https://en.wikipedia.org/wiki/" + r.article.title;
        const article_html = "<a href='" + article_url + "'>" + article_url + "</a>";
        setArticle(article_html);

		{/* Worker Information */}
		console.log(r.worker.hit_submits);
		console.log(r.worker.checked_status);
		console.log(r.worker.bad_s1_count);
		console.log(r.worker.good_s1_count);
		console.log(r.worker.worker_id);

		setWorkerHits(r.worker.hit_submits);
		setWorkerStatus(r.worker.checked_status);
		setBadCount(r.worker.bad_s1_count);
		setGoodCount(r.worker.good_s1_count);
		setWorkerId(r.worker.worker_id);
	})
    .catch(() => handleError());
  }

  const handleSubmit = (r) => {
    fetch(`https://the.mturk.monster:50000/api/eval_hit/${document.getElementById("hitid").textContent}/${r}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hit: {
            validator_username: inputRef.current.value === "" ? 'guest' : inputRef.current.value,
          }
        })
      })
    getHit();
  }

  const handleKeyDown = (e) => {
    if (document.querySelector(".Mui-focused")) return;
    if (e.key === " ") {
      getHit();
    } else if (e.key === '[') {
      handleSubmit("good");
    } else if (e.key === ']') {
      handleSubmit("bad");
    }
  }

	const getWorkerInfo = () => {
		var endpoint = 'https://the.mturk.monster:50000/api/check_worker_info/' + worker_id;
		fetch(endpoint)
			.then(r => r.json())
			.then(r => {

			})
			.catch(() => {});
	}

	const worker_stats = {
		submits: 15,
		checked_status: "checked",
		bad_count: 5,
	}

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Container>
      <Box style={{ padding: '5vh' }}>
        <Typography variant="h2" component="h1" style={{ textAlign: 'center' }}>
          CausalQA Validation
        </Typography>

        <div className="instructions">
          <Typography variant="h5" component="h1" className='subtitle'>
            Space = New Question
          </Typography>
          <Typography variant="h5" component="h1" className='subtitle'>
            [ = Approve
          </Typography>
          <Typography variant="h5" component="h1" className='subtitle'>
            ] = Reject
          </Typography>
        </div>
        <Box className='textfield-box'>
          <TextField
            className='username'
            id="textfield"
            style={{ width: '100%' }}
            placeholder="username"
            inputRef={inputRef}
          />
        </Box>

		<Typography variant="h5" component="h1" style={{textAlign: 'center' }}> Worker Information </Typography>
		<Typography variant="subtitle1" component="h1" style={{ marginBottom: '0.5em', fontWeight: 'bold' }}>Total # of HITs submitted: {worker_hits} &ensp; &ensp; &ensp; Worker Status: {worker_status} &ensp; &ensp; &ensp; Bad HIT Count: {bad_count} &ensp; &ensp; &ensp; Good HIT Count: {good_count}</Typography>

        <Box style={{ padding: '2vh' }}>
          <Typography variant="subtitle1" component="h1" style={{ marginBottom: '0.5em', fontWeight: 'bold' }}>ID:</Typography>
          <Typography variant="body1" id="hitid" component="p" style={{ marginBottom: '0.5em' }}>{hitId}</Typography>
          <Typography variant="subtitle1" component="h1" style={{ marginBottom: '0.5em', fontWeight: 'bold' }}>Article:</Typography>
          <Typography variant="body1" component="p" style={{ marginBottom: '0.5em' }} dangerouslySetInnerHTML={{ __html: article }} />
          <Typography variant="subtitle1" component="h1" style={{ marginBottom: '0.5em', fontWeight: 'bold' }}>Cause:</Typography>
          <Typography variant="body1" component="p" style={{ marginBottom: '0.5em' }}>{cause}</Typography>
          <Typography variant="subtitle1" component="h1" style={{ marginBottom: '0.5em', fontWeight: 'bold' }}>Effect:</Typography>
          <Typography variant="body1" component="p" style={{ marginBottom: '0.5em' }}>{effect}</Typography>
          <Typography variant="subtitle1" component="h1" style={{ marginBottom: '0.5em', fontWeight: 'bold' }}>Question:</Typography>
          <Typography variant="body1" component="p" style={{ marginBottom: '1em' }}>{question}</Typography>
          <Accordion className={"passage"} style={{ marginBottom: '5vh' }} expanded={expanded} onClick={() => setExpanded(!expanded)}>
            <AccordionSummary>
              <Typography variant="subtitle1" component="h1" style={{ fontWeight: 'bold' }}>Passage:</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" component="p" dangerouslySetInnerHTML={{ __html: passage }} />
            </AccordionDetails>
          </Accordion>
        </Box>
		<CustomButton id={worker_id}/>
      </Box>
    </Container>
  );
}

export default App;
