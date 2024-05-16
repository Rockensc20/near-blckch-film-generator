import Link from 'next/link';

import styles from '../styles/app.module.css';
import { useState, useEffect } from 'react';

import { useStore } from '@/layout';
import { FilmGenratorContract } from '../config';
// near api js
import { utils } from 'near-api-js';
export const DocsCard = () => {
  return (
    <Link
      href="https://docs.near.org/build/web3-apps/quickstart"
      className={styles.card}
      target='_blank'
      rel="noopener noreferrer"
    >
      <h2>
        Near Docs <span>-&gt;</span>
      </h2>
      <p>Learn how this application works, and what you can build on Near.</p>
    </Link>);
};

export const HelloNearCard = () => {
  return (
    <Link
      href="/hello-near"
      className={styles.card}
      rel="noopener noreferrer"
    >
      <h2>
        Near Integration <span>-&gt;</span>
      </h2>
      <p>Discover how simple it is to interact with a Near smart contract.</p>
    </Link>
  );
};

export const HelloComponentsCard = () => {
  return (
    <Link
      href="/hello-components"
      className={styles.card}
      rel="noopener noreferrer"
    >
      <h2>
        Web3 Components <span>-&gt;</span>
      </h2>
      <p>See how Web3 components can help you to create multi-chain apps.</p>
    </Link>
  );
}

export const DiscoverFilmGenCard = () => {
  return (
    <Link
      href="/film-generator"
      className={styles.card}
      rel="noopener noreferrer"
    >
      <h2>
        Film Generator <span>-&gt;</span>
      </h2>
      <p>Don't know what film to shoot? Look no further!</p>
    </Link>
  );
}

export const FilmGeneratorComponentCard = () => {
  const CONTRACT = FilmGenratorContract;
  const { signedAccountId, wallet } = useStore();
  const [loggedIn, setLoggedIn] = useState(false);  
  const [filmCombination, setFilmCombination] = useState('loading...');
  const [recentEntries, setRecentEntries] = useState([]);

  useEffect(() => {
    setLoggedIn(!!signedAccountId);
  }, [signedAccountId]);

  const FilmCombinationGenerator = () => {
      
      const [outputText, setOutputText] = useState("");
      const [donationAmounts, setDonationAmounts] = useState({});
      const [showSaveFields, setShowSaveFields] = useState(false);
      const [filmData, setFilmData] = useState({
        format: "",
        size: "",
        iso: "",
        camera: "",
        date: "",
        support: false,
      });

      if (wallet!=null){
        wallet.viewMethod({ contractId: CONTRACT, method: 'get_film_combinations'}).then(
          recentEntries => setRecentEntries((recentEntries))
        );
      }

      const saveFilmCombination = async () => {
        const format = filmData["format"];
        const size = filmData["size"];
        const iso = filmData["iso"];
        const camera = filmData["camera"];
        const date = new Date(Date.now());
        var deposit = 0;

        if (filmData["support"] == true){
          deposit = utils.format.parseNearAmount("0.5");
        }
        await wallet.callMethod({ contractId: CONTRACT, method: 'save_film_combination', args: {format,size,iso,camera,date} , deposit: deposit});
        
        const newEntry = { ...filmData };
        setRecentEntries((prevEntries) => [newEntry, ...prevEntries.slice(0, 9)]);
        // Clear input fields
        setFilmData({
          format: "",
          size: "",
          iso: "",
          photographer: "",
          date: "",
          support: false,
        });
      };    
    
      const handleGenerateClick = () => {
        if (!wallet) return;

        wallet.viewMethod({ contractId: CONTRACT, method: 'get_film_combination'}).then(
          filmCombination => setFilmCombination(filmCombination)
        );
        if (filmCombination["format"] != undefined){
          setOutputText(`How about some ${filmCombination["size"]} ${filmCombination["format"]} film with ${filmCombination["iso"]} ISO?\nIf you want to support the analog journey of this contract's developer click support to add a deposit of 0.5 NEAR`);
        }

        setFilmData({
          format: filmCombination["format"],
          size: filmCombination["size"],
          iso: filmCombination["iso"],
          camera: "",
          date: "",
          support: filmCombination["analogSupporter"],
        });
        setShowSaveFields(true); // Show the input fields after generating
      };

      const handleDonation = async(recipientAddress) => {
        const amount = donationAmounts[recipientAddress];
        const photographerToDonateTo = recipientAddress;
        if (amount) {
            const amountInYocto = utils.format.parseNearAmount(String(amount));
            console.log(`Donating ${amount} aka ${amountInYocto} YoctoNEAR to ${recipientAddress}`);
            if (!wallet) return;
            await wallet.callMethod({ contractId: CONTRACT, method: 'donate_to_photographer', args: {photographerToDonateTo}, deposit: amountInYocto });

        } else {
            console.log('Please enter a valid donation amount.');
        }
    };
    
      const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === "checkbox" ? checked : value;
        setFilmData((prevData) => ({ ...prevData, [name]: newValue }));
      };
    
      return (
        <div className="film-combination">
          <p>Welcome to the FilmGenerator built on NEAR!<br></br>
            Don't know what kind of film to put into your ancient camera for your next photo walk? - Well look no further!<br></br>
            <br></br>
            1) Click on the button below to let the Blockchain decide on a combination for you!<br></br>
            2) Save it to the blockchain to store it forever and show of to your fellow blockchain analog photographer friends
          </p>
          <textarea
            rows="5"
            cols="40"
            value={outputText}
            readOnly
            placeholder="Generated film combination will appear here"
          />
          <br></br>
          <br></br>
          <button onClick={handleGenerateClick}>
            Generate New Film Combination
          </button>
          <br></br>
          <br></br>
          {showSaveFields && (
            <div className="save-fields">
              <input
                readOnly
                type="text"
                name="format"
                placeholder="Format"
                value={filmData.format}
                onChange={handleInputChange}  
              />
              <input
                type="text"
                name="size"
                placeholder="Size"
                value={filmData.size}
                onChange={handleInputChange}
                readOnly
              />
              <input
                type="text"
                name="iso"
                placeholder="ISO"
                value={filmData.iso}
                onChange={handleInputChange}
                readOnly
              />
              <input
                type="text"
                name="camera"
                placeholder="Camera"
                value={filmData.camera}
                onChange={handleInputChange}
              />
              <label>
                <input
                  type="checkbox"
                  name="support"
                  checked={filmData.support}
                  onChange={handleInputChange}
                />
                Support
              </label>
              <br></br>
              <br></br>
              <button onClick={saveFilmCombination}>Save Film Combination</button>
            </div>
          )}
          <br></br>
          <table>
            <thead>
              <tr>
                <th style={{padding: "20px"}}>Format</th>
                <th style={{padding: "20px"}}>Size</th>
                <th style={{padding: "20px"}}>ISO</th>
                <th style={{padding: "20px"}}>Photographer</th>
                <th style={{padding: "20px"}}>Camera</th>
                <th style={{padding: "20px"}}>Date</th>
                <th style={{padding: "20px"}}>Supporter</th>
                <th style={{padding: "20px"}}>Support them</th>
              </tr>
            </thead>
            <tbody>
              {recentEntries.map((entry, index) => (
                <tr key={index}>
                  <td style={{padding: "20px"}}>{entry.format}</td>
                  <td style={{padding: "20px"}}>{entry.size}</td>
                  <td style={{padding: "20px"}}>{entry.iso}</td>
                  <td style={{padding: "20px"}}>{entry.photographer}</td>
                  <td style={{padding: "20px"}}>{entry.camera}</td>
                  <td style={{padding: "20px"}}>{entry.date}</td>
                  <td style={{padding: "20px"}}> {entry.analogSupporter ? "Yes" : "No"}</td> 
                  <td>
                            <input
                                type="number"
                                placeholder="Amount in NEAR"
                                onChange={(e) => setDonationAmounts({ ...donationAmounts, [entry.photographer]: parseFloat(e.target.value) })}
                            />
                            <button onClick={() => handleDonation(entry.photographer)}>Donate</button>
                            </td>
                             </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    };
    
    return FilmCombinationGenerator();
    

};