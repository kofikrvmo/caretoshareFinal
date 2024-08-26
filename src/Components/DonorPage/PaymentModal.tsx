import React, { useState} from 'react'
import { FormContainer, FormWrapper,Heading, InputField } from '../Login/LoginStyles';
import { FormField } from 'semantic-ui-react';
import { PaystackButton } from 'react-paystack';
import { Modal } from 'react-bootstrap';

interface IPaymentModal {
    showModal: boolean;
    setShowModal: (show: boolean) => void;
}

function PaymentModal({showModal, setShowModal} : IPaymentModal){
    const [formData, setFormData] = useState({email: "", amount: 0 });
    const amount = formData.amount * 100; 
    const componentProps = {
        email: formData.email,
        phone: '0500600906',
        amount: amount,
        currency: 'GHS',
        publicKey: 'pk_test_79d21483fdc8afced8e6f42ca7d87acb9b4b9d87',
        text: "Donate now",
        onSuccess: () =>
           alert("payment was successful")
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target
        setFormData(prev => {
            return {
                ...prev,
                [name] : value
            }
        })
    }


    return (
        <Modal 
            show={showModal}
            onHide={() => setShowModal(false)}>
        <FormWrapper>
            <Heading>
                <h3>Payment Details</h3>
            </Heading>
            <FormContainer>
        
                <FormField>
                <InputField
                            type='email'
                            placeholder='Email'
                            name='email'
                            value={formData.email}
                            required
                            onChange={handleChange}
                        />
                </FormField>
                <FormField>
                <InputField
                            type='number'
                            placeholder='Amount'
                            name="amount"
                            value={formData.amount}
                            required
                            onChange={handleChange}
                        />
                </FormField>
                <PaystackButton {...componentProps}/>
            </FormContainer>
        </FormWrapper>
        </Modal>
    )
}




export default PaymentModal;