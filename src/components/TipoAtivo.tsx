import React from 'react';

interface props{
    grupo: string;
    saldo: string;
    class: string;
}

export const TipoAtivo: React.FC<props> = (props) => {
    return (
        <>
            <div id={props.class} className='div-balanco'>
                <h2 className='titulo-contas'>
                    {props.grupo}
                </h2>
                <h2>
                    {props.saldo}
                </h2>
            </div>
        </>
    );
}