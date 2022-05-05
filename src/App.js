import { Box, Container, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [hitId, setHitId] = useState(-1);
  const [cause, setCause] = useState('cause');
  const [effect, setEffect] = useState('effect');
  const [question, setQuestion] = useState('question');

  const handleError = () => {
    setCause('Error retrieving next hit (maybe DB empty?)');
    setEffect('Error retrieving next hit (maybe DB empty?)');
    setQuestion('Error retrieving next hit (maybe DB empty?)');
  }

  const getHit = () => {
    fetch('https://the.mturk.monster:50000/api/get_hit/null')
      .then(r => r.json())
      .then(r => {
        if (r.error) {
          handleError();
        }

        setHitId(r.hit.id);
        setCause(r.hit.cause);
        setEffect(r.hit.effect);
        setQuestion(r.hit.question);
      })
      .catch(() => handleError());
  }

  const handleSubmit = (r) => {
    fetch(`https://the.mturk.monster:50000/api/eval_hit/${document.getElementById("hitid").textContent}/${r}`, { method: 'POST' });
    getHit();
  }

  const handleKeyDown = (e) => {
    if (e.key === " ") {
      getHit();
    } else if (e.key === '[') {
      handleSubmit("good");
    } else if (e.key === ']') {
      handleSubmit("bad");
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Container>
      <Box style={{ padding: '10vh' }}>
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

        <Box style={{ padding: '5vh' }}>
          <Typography variant="subtitle1" component="h1" style={{ marginBottom: '0.5em', fontWeight: 'bold' }}>ID:</Typography>
          <Typography variant="body1" id="hitid" component="p" style={{ marginBottom: '0.5em' }}>{hitId}</Typography>
          <Typography variant="subtitle1" component="h1" style={{ marginBottom: '0.5em', fontWeight: 'bold' }}>Cause:</Typography>
          <Typography variant="body1" component="p" style={{ marginBottom: '0.5em' }}>{cause}</Typography>
          <Typography variant="subtitle1" component="h1" style={{ marginBottom: '0.5em', fontWeight: 'bold' }}>Effect:</Typography>
          <Typography variant="body1" component="p" style={{ marginBottom: '0.5em' }}>{effect}</Typography>
          <Typography variant="subtitle1" component="h1" style={{ marginBottom: '0.5em', fontWeight: 'bold' }}>Question:</Typography>
          <Typography variant="body1" component="p" style={{ marginBottom: '5vh' }}>{question}</Typography>
          {/* <TextField
            id="textfield"
            style={{ width: '100%' }}
            value={reason}
            onChange={handleReasonChange}
            onKeyDown={handleKeyDown}>
            {reason}
          </TextField> */}
        </Box>
      </Box>
    </Container>
  );
}

export default App;
