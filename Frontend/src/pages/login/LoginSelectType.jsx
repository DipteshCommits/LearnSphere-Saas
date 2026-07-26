import { Box, Card, CardActionArea, CardContent, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const options = [
    { label: 'School', value: 'school' },
    { label: 'College', value: 'college' },
    { label: 'Organization / Tuition', value: 'org' }
];


export default function LoginSelectType() {
    const navigate = useNavigate();

    return (
        <Box display="flex" gap={3} justifyContent="center" mt={10} >
            {options.map(opt => (
                <Card key={opt.value} sx={{width:250}} >
                    <CardActionArea onClick={()=> navigate(`/login/${opt.value}`)}>
                        <CardContent>
                            <Typography variant='h6' align='center'>
                                {opt.label}
                            </Typography>
                        </CardContent>
                    </CardActionArea>
                </Card>
            ))}


        </Box>
    );
}
