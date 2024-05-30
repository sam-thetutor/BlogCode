import { useState } from 'react';
import { backend } from 'declarations/backend';
import { Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {

  return (
    <>
        {/* <Header/> */}
      <Routes>
    
          <Route path='/' element={<Login />} />
           <Route path="dashboard" element={<Dashboard />} />

          
          {/* <Route index element={<Dashboard />} />
          <Route path="create" element={<CreateToken/>}/>
          <Route path="mytokens" element={<MyTokens/>}/>
          <Route path="mytokens/:tokenId" element={<TokenPage/>}/>  */}
          {/* </Route> */}
      </Routes>

    
    
    </>
    

  );
}

export default App;
