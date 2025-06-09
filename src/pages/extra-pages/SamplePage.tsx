// material-ui
import { Button, Typography } from '@mui/material';
import {
  MainCard
} from '@digitalaidseattle/mui';
import { createClient } from '@supabase/supabase-js'
import { useState } from 'react';
// project import

// ==============================|| SAMPLE PAGE ||============================== //

const SamplePage = () => {
  const [message, setMessage] = useState<string>('Click on the button!');

  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  )

  function clickHandler() {
    supabase.functions
      .invoke('hello-world', {
        body: { name: ', I just called an Edge Function' }
      })
      .then(resp => {
        setMessage(resp.data.message);
      })
      .catch(error => {
        console.error('Error invoking function:', error);
      });
  }

  return (
    <MainCard title="Sample Card">
      <Button onClick={clickHandler} variant="contained" color="primary">Click</Button>
      <Typography variant="body2">
        {message}
      </Typography>
    </MainCard>
  )
};

export default SamplePage;
