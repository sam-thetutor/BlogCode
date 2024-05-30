import { useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react'



const useGetData = () => {
    const queryClient = useQueryClient();


    const { data: backendActor } = useQuery({
        queryKey: ['backendActor'],
    });

    const { data: principal } = useQuery({
        queryKey: ['principal'],
    });


    //funxtion to load all the posts data
    const loadAllPosts = async () => {

        try {
            if (!principal || !backendActor) return {}

            let results = await backendActor.get_all_posts()

            return results

        } catch (error) {

            console.log("erro in geting all users posts :", error)
        }

    }



    //funtion to load the users data
    const loadAllPostsByUser = async () => {

        try {
            if (!principal || !backendActor) return {}
            let results = await backendActor.get_all_posts_bu_user(principal)
            return results
        } catch (error) {

            console.log("erro in geting all users posts :", error)
        }

    }












    return (
        <div>

        </div>
    )
}

export default useGetData
