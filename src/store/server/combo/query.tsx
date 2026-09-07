import { axios } from "@/api"
import { useQuery } from "@tanstack/react-query";

const comboCategories = async () =>{
    const {data} = await axios.get('combo-tour-categories')
    return data;
}
export const useComboCategories = () => {
    return useQuery({
        queryKey: ['combo-categories'],
        queryFn: comboCategories,

    })
}