import { useMutation, useQuery } from '@tanstack/react-query';
import React, { useState } from 'react'

const Dashboard = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const {data:backendActor} = useQuery({
        queryKey:["backendActor"]
    })

    


    const { mutateAsync: HandleNewPostCreation } = useMutation({
        mutationFn: (data) => handleSubmit(data),
        onSuccess: async () => {

        //   await invalidateUserCreatedTokens(),
        //     await invalidateUserICPBalance()

        //   setIsLoading(false)
    
        },
      });



    const handleSubmit = async(e) => {
        e.preventDefault();
        

        const results = await backendActor.add_post(title,content)
        console.log("new post results :",results)
        setTitle('');
        setContent('');
    };




    return (
        <div>

            {/* form div */}
            <div style={{ display: "flex", flexDirection: "column" }}>
                <form onSubmit={HandleNewPostCreation}>
                    <div>
                        <label htmlFor="title">Title:</label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="content">Content:</label>
                        <textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                        ></textarea>
                    </div>
                    <button type="submit">Submit</button>
                </form>
            </div>

            {/* div to display all the users posts */}

            <div>
                all users posts
            </div>




        </div>
    )
}

export default Dashboard
