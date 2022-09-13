import { useState, useEffect, useRef } from 'react';
import {Client as Styletron} from 'styletron-engine-atomic';
import {Provider as StyletronProvider} from 'styletron-react';
import {LightTheme, BaseProvider, styled} from 'baseui';
import { FormControl } from "baseui/form-control";
import { Input } from "baseui/input";
import {StyledLink as Link} from 'baseui/link';
import {FlexGrid, FlexGridItem} from 'baseui/flex-grid';
import {Avatar} from 'baseui/avatar';
import {Grid, Cell} from 'baseui/layout-grid';
import {
  Delete,
  Search,
  Plus,
  CheckIndeterminate,
} from "baseui/icon";

import {
  HeadingXXLarge,
  HeadingXLarge,
  HeadingLarge,
  HeadingMedium,
  HeadingSmall,
  HeadingXSmall,
} from 'baseui/typography';
import { ButtonGroup } from "baseui/button-group";
import { Button } from "baseui/button";

import { Spinner , SIZE} from "baseui/spinner";
import {Block} from 'baseui/block';
import  Nav  from "./Nav"
import Table from "./Table"

import {
  PayPalScriptProvider,
  PayPalButtons,
  usePayPalScriptReducer
} from "@paypal/react-paypal-js";

const engine = new Styletron();
const itemProps = {
  backgroundColor: 'white',
  height: 'scale1000',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

function App() {

const [codigo, setCodigo] = useState('')
const [total, setTotal] = useState(0)
const [listaProduto, setListaProduto] = useState([])
const [isLoading, setIsLoading] = useState(false)
const [pagar, setPagar] = useState(false)

// This values are the props in the UI
const amount = "20";
const currency = "BRL";
const style = {"layout":"vertical"};

useEffect(()=>{ 
  if(listaProduto.length > 0) {
    setTotal( listaProduto.map(item =>item.price).reduce(function(soma, i) {
      return soma + i;
    }) )
  }
},[listaProduto])

const handleGetProduto = async () => {
  if(codigo != ''){
    setIsLoading(true)
    await fetch(`https://fakestoreapi.com/products/${codigo}`)
              .then(res=>res.json())
              .then(json=> setListaProduto([...listaProduto, json]))
              .then( _ => setCodigo(''))
              .then(_ => setIsLoading(false))
  }
}
const handleAdicionaQuantidade = () => {}

const handleDiminuiQuantidade = () => {}

const handleRealizarPagamento = () => {
  if(total > 0){
    setPagar(true)
  }else{
    alert("Adicione um produto para continuar.")
  }
}

// Custom component to wrap the PayPalButtons and handle currency changes
const ButtonWrapper = ({ currency, showSpinner }) => {
  // usePayPalScriptReducer can be use only inside children of PayPalScriptProviders
  // This is the main reason to wrap the PayPalButtons in a new component
  const [{ options, isPending }, dispatch] = usePayPalScriptReducer();

  useEffect(() => {
      dispatch({
          type: "resetOptions",
          value: {
              ...options,
              currency: currency,
          },
      });
  }, [currency, showSpinner]);


  return (<>
          { (showSpinner && isPending) && <div className="spinner" /> }
          <PayPalButtons
              style={style}
              disabled={false}
              forceReRender={[total, currency, style]}
              fundingSource={undefined}
              createOrder={(data, actions) => {
                  return actions.order
                      .create({
                          purchase_units: [
                              {
                                  amount: {
                                      currency_code: currency,
                                      value: total,
                                  },
                              },
                          ],
                      })
                      .then((orderId) => {
                          return orderId;
                      });
              }}
              onApprove={function (data, actions) {
                  /**
                 * data: {
                 *   orderID: string;
                 *   payerID: string;
                 *   paymentID: string | null;
                 *   billingToken: string | null;
                 *   facilitatorAccesstoken: string;
                 * }
                 */

                  return actions.order.capture().then( (details) => {
                    alert(
                      "Transaction completed by" +
                        (details?.payer.name.given_name ?? "No details")
                    );
            
                    alert("Data details: " + JSON.stringify(data, null, 2));
                  });
              }}
          />
      </>
  );
}

  return (
    <StyletronProvider value={engine}>
      <BaseProvider theme={LightTheme}>
        <Nav/>
          {/* Input para buscar o produto */} 
        <FormControl label={() => "Código do produto"} caption={() => "Digite o código do produto para realizar a venda"}>
            <ButtonGroup>
              <Input  value={codigo} onChange={e => setCodigo(e.target.value)} placeholder="Código do produto"  />
              <Button onClick={e => handleGetProduto()} >   {isLoading == true ? <Spinner  $size={SIZE.small}/> :  <Search/> } </Button>
              <Button> <CheckIndeterminate/> </Button>
              <Button> <Plus/> </Button>
            </ButtonGroup>
          </FormControl>

          <HeadingMedium>Total a pagar : {total.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'})}</HeadingMedium>

          
          { listaProduto.length > 0 ?  <Table listaProduto={listaProduto}/>  : null}


          <FormControl>
                <Button onClick={ () => handleRealizarPagamento()}> Fechar lançamento </Button>
          </FormControl>

          {pagar ? (  
                      <PayPalScriptProvider
                            options={{
                                "client-id": "ASFC59ET9sLotlKPwGvcwSKHKY-aS-DD7LDV4ZcSpPFpZb9ip-oiJ2WaYMT9JjzdfLrjqkC96vQ4RA6j",
                                components: "buttons",
                                currency: "BRL"
                            }}
                        >
                            <ButtonWrapper
                                currency={currency}
                                showSpinner={true}
                            />
                      </PayPalScriptProvider>
                 ) : null }

        
          
      </BaseProvider>
    </StyletronProvider>
  );
}

export default App;
