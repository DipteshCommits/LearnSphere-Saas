import { useEffect, useState } from "react";
import GeneralInformationForm from "../../../components/admin/school/generalInformationForm";
import BrandingForm from "../../../components/admin/school/BrandingForm";
import ContactInformationForm from "../../../components/admin/school/ContactInformationForm";
import AddressForm from "../../../components/admin/school/AddressForm";


export default function SchoolProfile() {

    return (
        <>
            <GeneralInformationForm />
            <BrandingForm />
            <ContactInformationForm />
            <AddressForm />
        </>
    );
}