import { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { z } from 'zod';
import './App.css';
import { getRequest } from './utils/api-requests';

let messagesArray: LoadingMessage[] = [];
let bufArray: LoadingMessage[] = [];

const loadingMessageValidator = z.object({
    message: z.string(),
    triple_end_of: z.string(),
    message_before: z.string().nullable().optional(),
    progress: z.number().nullable().optional(),
});

async function getMessages(){
    return z.array(loadingMessageValidator).parse((await (await getRequest('loading/info', 5100)).data));
}

type LoadingMessage = z.infer<typeof loadingMessageValidator>;

function App() {
    const [currentMessage, setCurrentMessage] = useState<(string|JSX.Element)[]>(parseSimsString({message: 'ЗАГРУЖАЕМ СМЕШНЫЕ СООБЩЕНИЯ', triple_end_of: '.'}));

    useEffect(() => {
        let progressInterval: NodeJS.Timer | undefined;
        const messagesLoop = setInterval(() => {
            if(messagesArray.length === 0){
                messagesArray = [...bufArray];
                bufArray = [];
            }
            const newIndex = getRandomInt(messagesArray.length - 1);
            bufArray.push(messagesArray[newIndex]);
            if(messagesArray[newIndex].message_before){
                let message_after = messagesArray[newIndex];
                setCurrentMessage(parseSimsString({message: messagesArray[newIndex].message_before!, triple_end_of: '.'}));
                setTimeout(() => {
                    setCurrentMessage(parseSimsString(message_after));
                },7500);
            }else{
                setCurrentMessage(parseSimsString(messagesArray[newIndex]));
            }
            clearInterval(progressInterval);
            console.log(messagesArray[newIndex].progress)
            if(messagesArray[newIndex].progress){
                let secondAdd = Math.round((messagesArray[newIndex].progress! - 99) / 4); //todo: get the divisor from the backend
                secondAdd = secondAdd ? secondAdd : 1;
                const firstAdd = 9; //todo: get the first addend from the backend
                let progressCount = 0 - firstAdd;
                let curEnd = messagesArray[newIndex].progress!;
                progressInterval = setInterval(() => {
                    setCurrentMessage(oldString => {
                        let newString = [...oldString];
                        progressCount+= progressCount < 99 ? firstAdd : secondAdd;
                        if(progressCount > curEnd){
                            progressCount = curEnd;
                            clearInterval(progressInterval);
                            progressInterval = undefined;
                        }
                        newString[newString.length - 1] = ` ${(progressCount)}%`;
                        return newString;
                    });
                },1000);
            }
            messagesArray.splice(newIndex, 1);
        },19000);
        return () => {
            clearInterval(messagesLoop);
            clearInterval(progressInterval);
        }
    },[])

    useQuery(['loading-messages'], () => getMessages(), {
        onSuccess: (response) => {
            messagesArray = response;
        },
        refetchOnWindowFocus: false
    });

    function getRandomInt(max: number){
        return Math.floor(Math.random() * max);
    }

    function parseSimsString(input: LoadingMessage){
        let buf = '';
        let newString: (JSX.Element)[] = [];
        let key = 0;
        for(const char of input.message){
            switch(char){
                case '{':
                    newString.push(<span key={key}>{buf}</span>);
                    key++;
                    buf = '';
                    break;
                case '}':
                    newString.push(<span className={`effect-af`} key={key}>{buf}</span>);
                    key++;
                    buf = '';
                    break;
                default:
                    buf += char;
            }
        }
        newString.push(<span key={key}>{buf}</span>);
        key++;
        newString.push(
        <span key={key}>
            <span className='dot1'>{input.triple_end_of}</span>
            <span className='dot2'>{input.triple_end_of}</span>
            <span className='dot3'>{input.triple_end_of}</span>
        </span>);
        key++
        if(input.progress){
            newString.push(<span key={key}> 0%</span>)
        }
        return newString;
    }

    return (
    <div className="background">
        <div className='message'>
            {currentMessage}
        </div>
    </div>
  );
}

export default App;
