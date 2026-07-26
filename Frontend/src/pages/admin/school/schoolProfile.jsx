import { useEffect, useState } from "react";
import GeneralInformationForm from "../../../components/admin/school/generalInformationForm";
import BrandingForm from "../../../components/admin/school/BrandingForm";
import ContactInformationForm from "../../../components/admin/school/ContactInformation";
import AddressForm from "../../../components/admin/school/AddressForm";
import RegionalSettingsForm from "../../../components/admin/school/RegionalSettingsForm";

export default function SchoolProfile() {

    return (
        <>
            <GeneralInformationForm />
            <BrandingForm />
            <ContactInformationForm />
            <AddressForm />
            <RegionalSettingsForm />
        </>
    );
}