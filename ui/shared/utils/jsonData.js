import data from "../components/panel/variants/PublicationData/allgenes.json"

export const geneData = data;
export const geneDataByGene = data => data.reduce((acc, row) => ({ ...acc, [row.gene]: row }), {})