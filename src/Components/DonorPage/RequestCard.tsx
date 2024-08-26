import React, { useEffect, useState } from 'react';
import { CampaignCardWrapper, CampaignImageContainer, CampaignDetailsContainer, SupportCampaignButton, InputField } from './DonorStyles';
import image1 from '../HomePage/images/image2.jpg';
import { RequestCardProp} from '../Shared_util/Constants/Types';
import { calculateDaysLeft } from '../Shared_util/Constants/Functions';
import ProgressBar from 'react-bootstrap/ProgressBar';
import { useNavigate } from "react-router-dom";
import { MdMoreTime } from 'react-icons/md';
import { BASE_URL } from '../Shared_util/Constants/Base_URL';
import { PaystackButton } from 'react-paystack';
import { FormField } from '../Login/LoginStyles';
import styled from 'styled-components'
import LoginToast from "../Shared_util/Toast/LoginToast";
import { v4 } from 'uuid';


const RequestCard: React.FC<RequestCardProp> = ({ details }) => {
    const { organisationName ,organisationContact, email, campaignImage, campaignTitle, endDate, description, target, startDate, campaignId, requestStatus, donationType } = details;
    const navigate = useNavigate();
    const [amount, setAmount] = useState('1')
    const [totalDonations, setTotalDonations] = useState(0)
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    console.log(totalDonations)

    const PaystackBtn = styled(PaystackButton)`
    width: 200px;
    outline: 0;
    border: 1px solid white;
    border-radius: 5px;
    transition: all 0.5s ease-in-out;
    padding: 5px;
    align-item: center;


    &:hover{
        border: 1px solid ${({ theme }) => theme.background.primary};
        background: white;
    }

    @media (max-width: 541px){
                width: 250px;
            }
`
    const AmountLabel = styled.p`
        text-align: left;
        width: 100%;
        font-weight: 700;
        font-family: Poppins, sans-serif;
        color: ${({ theme }) => theme.background.primary}; 
`

    const progress = target && Math.floor((totalDonations / target) * 100);
    const tokenData = sessionStorage.getItem("accesstoken");
    const accessToken = tokenData && JSON.parse(tokenData);
    const userData = sessionStorage.getItem("userDetails");
    const userDetails = userData && JSON.parse(userData);
    
    const componentProps = {
        email: 'kofikrvmo@icloud.com',
        phone: '0500600906',
        amount: parseInt(amount) * 100,
        currency: 'GHS',
        publicKey: 'pk_test_79d21483fdc8afced8e6f42ca7d87acb9b4b9d87',
        text: "Donate now",
        onSuccess: async () => {
            await handleMonetaryDonation()
        }
    }


    const getAllDonations = async () => {
        try {
            const response = await fetch(`${BASE_URL}/donations/${campaignId}`, {
                method: 'GET',
                headers: {
                    'content-type': 'application/json',
                    'authorization': `Bearer ${accessToken}`,
                },
            });

            if (response.status === 401) return navigate("/login");

            if (response.status === 500) return;

            const results = await response.json();
            let total;
            if (donationType === "monetary") {
                total = results.data.reduce((accumulator: number, currentValue: any) => accumulator + currentValue?.amountDonated, 0);
                setTotalDonations(total)
            } else {
                total = results.data.filter((item: { donationStatus: string }) => item.donationStatus === "Accepted").reduce((accumulator: number, currentValue: any) => accumulator + currentValue?.quantity, 0);
                setTotalDonations(total)
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleMonetaryDonation = async () => {        
        try {
               const donation = {
                    donationId: v4(),
                    campaignId: campaignId,
                    donatedBy: userDetails.username,
                    donorEmail: userDetails.email,
                    organisationEmail : email,
                    organisationContact: organisationContact,
                    donatedTo : organisationName,
                    contact : userDetails.contact,
                    amountDonated:  parseInt(amount),
                 }        
                 const response = await fetch(`${BASE_URL}/donations`, {
                    method: "POST",
                    headers: {
                        "content-type": "application/json",
                        authorization: `Bearer ${accessToken}`,
                     },         
                    body: JSON.stringify(donation),
        });

        if (response.status === 401) {
            navigate("/login");
            return;
        }

        if (response.status === 400) {
            setToastMessage("An error occured, try again later");
            setShowToast(true);
            return;
        }
        const results = await response.json();
        if(results.status === "success"){
            setToastMessage(`Successfully donated Ghc ${amount} to ${organisationName}`);
            setShowToast(true);
            setTimeout(()=>{
                navigate("/login/donor/");
                sessionStorage.setItem("page", "");  
            },2000)   
        }
    
    } catch(error){
        console.log("An error occured")
        console.log(error)
    }
}

    const handleDonation = () => {
        sessionStorage.setItem('campaign', JSON.stringify(details))
        sessionStorage.setItem('totalDonations', JSON.stringify(totalDonations))
        navigate("makeDonations")
    }



useEffect(() => {
    getAllDonations();
}, []);

return (
    <CampaignCardWrapper>
        {campaignImage ?
            <CampaignImageContainer src={campaignImage} alt='request-photo' /> :
            <CampaignImageContainer src={image1} alt='request-photo' />
        }

        <CampaignDetailsContainer>
            <div>
                <span className='heading'>Campaign</span>
                <span className='content'>{campaignTitle}</span>
            </div>
            <div>
                <span className='heading'>About</span>
                <span className='content'>{description}</span>
            </div>

            <div>
                <span className='heading'>Organisation</span>
                <span className='content'>{organisationName}</span>
            </div>
            <div>
                <span className='heading'>Status</span>
                <span className='content'>
                    {calculateDaysLeft(startDate, endDate) === "Not Started" ? "Pending" : requestStatus}
                </span>
            </div>
            <div>
                <span className='heading'>Days Left</span>
                <span className='content'>
                    <MdMoreTime size={25} color='green' />{" "}
                    {calculateDaysLeft(startDate, endDate)}
                </span>
            </div>

            <div style={{ width: "40%" }}>
                <span className='heading'>
                   {donationType === "monetary" ? `GHC ${totalDonations} raised of  GHC ${target}`:`${totalDonations} raised of ${target}` } 
                </span>
                <span className='progress'>
                    <ProgressBar now={progress} label={`${progress}%`} variant='success' />
                </span>

            </div>

            {
                donationType === "monetary" && <FormField >
                    <AmountLabel>Amount</AmountLabel>
                    <InputField
                        type='number'
                        placeholder='Enter amount you want to donate'
                        name="amount"
                        value={amount}
                        required
                        onChange={(e) => setAmount(e.target.value)}
                    />
                </FormField>}


            {
                donationType === "monetary" ? <PaystackBtn {...componentProps} /> : <SupportCampaignButton
                    onClick={() => handleDonation()}
                    disabled={calculateDaysLeft(startDate, endDate) === "Not Started"}
                >
                    Donate Now
                </SupportCampaignButton>
            }


        </CampaignDetailsContainer>
        <LoginToast
            showToast={showToast}
            setShowToast={setShowToast}
            toastMessage={toastMessage}
        />
    </CampaignCardWrapper>
);
};

export default RequestCard;
